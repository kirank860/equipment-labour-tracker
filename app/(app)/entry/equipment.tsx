import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  StatusBar, Modal, FlatList, ActivityIndicator, Alert, Platform, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronDown, Check, X, Camera, Image as ImageIcon, Truck, Calendar, Clock } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { getLocalDateString } from '../../../lib/dateUtils';

// Helper for modal picker
const CustomPicker = ({ label, value, options, onSelect, placeholder, required = false }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-white border border-slate-300 rounded-lg px-4 py-3.5 flex-row items-center justify-between active:opacity-70"
      >
        <Text className={value ? "text-slate-900" : "text-slate-400"}>
          {value ? options.find(o => o.value === value)?.label || placeholder : placeholder}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl h-[60%] border-t border-slate-200 shadow-2xl">
            <View className="flex-row items-center justify-between p-5 border-b border-slate-100">
              <Text className="text-slate-900 text-lg font-black tracking-tight">Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full active:opacity-60">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                  className="flex-row items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50"
                >
                  <Text className={`text-base ${value === item.value ? 'text-[#1e3a8a] font-bold tracking-tight' : 'text-slate-700 font-medium'}`}>
                    {item.label}
                  </Text>
                  {value === item.value && <Check size={20} color="#1e3a8a" />}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function EquipmentEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickImage = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const [jobs, setJobs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  
  const [formData, setFormData] = useState({
    entry_date: getLocalDateString(),
    job_id: '',
    supplier_id: '',
    equipment_id: '',
    rental_type: 'HOURLY',
    start_time: '08:00',
    end_time: '18:00',
    break_hours: '1',
    working_hours: '9',
    number_of_trips: '',
    vehicle_number: '',
    foreman_name: '',
    engineer_name: '',
    remarks: ''
  });

  const rentalTypes = [
    { label: 'Hourly', value: 'HOURLY' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Trip Basis', value: 'TRIP_BASIS' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto calculate working hours if valid times provided
    try {
      if (formData.start_time && formData.end_time) {
        const [startH, startM] = formData.start_time.split(':').map(Number);
        const [endH, endM] = formData.end_time.split(':').map(Number);
        
        if (!isNaN(startH) && !isNaN(endH)) {
          let diff = (endH + endM/60) - (startH + startM/60);
          if (diff < 0) diff += 24; // Cross midnight
          
          const breakHrs = parseFloat(formData.break_hours) || 0;
          const working = Math.max(0, diff - breakHrs);
          
          setFormData(prev => ({ ...prev, working_hours: working.toFixed(1).replace(/\.0$/, '') }));
        }
      }
    } catch (e) {
      // Ignore
    }
  }, [formData.start_time, formData.end_time, formData.break_hours]);

  const fetchData = async () => {
    try {
      const [jobsRes, suppliersRes, equipRes, { data: { user } }] = await Promise.all([
        supabase.from('jobs').select('id, job_number, job_name').eq('is_active', true),
        supabase.from('suppliers').select('id, supplier_name').eq('is_active', true),
        supabase.from('equipment_master').select('id, equipment_name, equipment_category').eq('is_active', true),
        supabase.auth.getUser()
      ]);

      if (jobsRes.data) setJobs(jobsRes.data.map(j => ({ label: `${j.job_number} - ${j.job_name}`, value: j.id })));
      if (suppliersRes.data) setSuppliers(suppliersRes.data.map(s => ({ label: s.supplier_name, value: s.id })));
      if (equipRes.data) setEquipmentList(equipRes.data.map(e => ({ label: `${e.equipment_category}: ${e.equipment_name}`, value: e.id })));
      
      if (user) {
        const { data: userData } = await supabase.from('users').select('full_name, email').eq('id', user.id).maybeSingle();
        if (userData) {
          let name = userData.full_name || '';
          if (name === 'New User' && userData.email) {
            name = userData.email.split('@')[0];
          }
          setFormData(prev => ({ ...prev, foreman_name: name }));
        }
      }
      
      if (id) {
        const { data: entryData } = await supabase.from('equipment_entries').select('*').eq('id', id).single();
        if (entryData) {
          setFormData({
            entry_date: entryData.entry_date,
            job_id: entryData.job_id,
            supplier_id: entryData.supplier_id,
            equipment_id: entryData.equipment_master_id,
            rental_type: entryData.rental_type,
            start_time: entryData.start_time ? entryData.start_time.substring(0, 5) : '',
            end_time: entryData.end_time ? entryData.end_time.substring(0, 5) : '',
            break_hours: entryData.break_hours ? entryData.break_hours.toString() : '0',
            working_hours: entryData.working_hours ? entryData.working_hours.toString() : '0',
            number_of_trips: entryData.number_of_trips ? entryData.number_of_trips.toString() : '',
            vehicle_number: entryData.vehicle_number || '',
            foreman_name: entryData.foreman_name || '',
            engineer_name: entryData.engineer_name || '',
            remarks: entryData.remarks || ''
          });
          if (entryData.equipment_photo_url && entryData.equipment_photo_url !== 'pending') {
            setPhotoUri(entryData.equipment_photo_url);
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.job_id || !formData.supplier_id || !formData.equipment_id) {
      Alert.alert('Validation Error', 'Please select Job, Supplier, and Equipment Type.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let uploadedPhotoUrl = 'pending';

      if (photoUri) {
        try {
          const fileName = `equipment_${Date.now()}.jpg`;
          const response = await fetch(photoUri);
          const blob = await response.blob();
          
          const { data, error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(fileName, blob, { contentType: 'image/jpeg' });
            
          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload photo. Please ensure the "receipts" bucket exists and is public.');
          }
          
          const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
          uploadedPhotoUrl = publicUrl;
        } catch (err: any) {
          throw new Error(err.message || 'Photo upload failed');
        }
      }

      const payload = {
        entry_date: formData.entry_date,
        job_id: formData.job_id,
        supplier_id: formData.supplier_id,
        equipment_master_id: formData.equipment_id,
        rental_type: formData.rental_type,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        break_hours: parseFloat(formData.break_hours) || 0,
        working_hours: parseFloat(formData.working_hours) || 0,
        number_of_trips: formData.rental_type === 'TRIP_BASIS' ? parseInt(formData.number_of_trips) || null : null,
        vehicle_number: formData.vehicle_number,
        foreman_name: formData.foreman_name,
        engineer_name: formData.engineer_name || '',
        equipment_photo_url: uploadedPhotoUrl,
        remarks: formData.remarks || null,
        created_by: user?.id || null,
        status: 'SUBMITTED',
        rejection_reason: null
      };

      let error;
      if (id) {
        const { error: updateError } = await supabase.from('equipment_entries').update(payload).eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('equipment_entries').insert(payload);
        error = insertError;
      }
      
      if (error) {
        if (error.code === '23503') {
          throw new Error('Your account profile is not fully set up. Please log out completely and log back in to fix this automatically.');
        }
        throw error;
      }
      
      setSuccessVisible(true);
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Failed to submit entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#1e3a8a]">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(app)/entry/select');
              }
            }}
            className="p-2 -ml-2 rounded-full active:opacity-60"
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">Equipment Entry</Text>
        </View>
        <TouchableOpacity 
          onPress={handleSubmit}
          className="flex-row items-center active:opacity-70"
        >
          <Check size={20} color="#ffffff" />
          <Text className="text-white font-semibold ml-1">Save</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={successVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm border border-slate-200 shadow-2xl">
            <View className="bg-green-100 p-4 rounded-full mb-4">
              <Truck size={64} color="#10b981" />
            </View>
            <Text className="text-2xl font-black text-slate-900 mb-2">Success!</Text>
            <Text className="text-slate-500 text-center mb-8">
              Your equipment entry has been {id ? 'updated' : 'submitted'} successfully and is awaiting review.
            </Text>
            <TouchableOpacity 
              className="w-full bg-[#1e3a8a] rounded-xl py-4 items-center"
              onPress={() => {
                setSuccessVisible(false);
                router.replace('/(app)/home');
              }}
            >
              <Text className="text-white font-bold text-lg">Continue to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="flex-row items-center mb-6">
          <Truck size={24} color="#1e3a8a" />
          <Text className="text-lg font-bold text-[#1e3a8a] ml-2">Equipment Information</Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Date <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 h-14">
            <Calendar size={20} color="#94a3b8" className="mr-3" />
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) => updateForm('entry_date', e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}
              />
            ) : (
              <TextInput
                value={formData.entry_date}
                onChangeText={(t) => updateForm('entry_date', t)}
                className="flex-1 text-slate-900 text-base font-medium"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
            )}
          </View>
        </View>

        <CustomPicker 
          label="Job Number"
          required={true}
          value={formData.job_id}
          options={jobs}
          onSelect={(v) => updateForm('job_id', v)}
          placeholder="Select Job"
        />

        <CustomPicker 
          label="Supplier Name"
          required={true}
          value={formData.supplier_id}
          options={suppliers}
          onSelect={(v) => updateForm('supplier_id', v)}
          placeholder="Select Supplier"
        />

        <CustomPicker 
          label="Equipment Name"
          required={true}
          value={formData.equipment_id}
          options={equipmentList}
          onSelect={(v) => updateForm('equipment_id', v)}
          placeholder="Select Equipment"
        />

        <CustomPicker 
          label="Rental Type"
          required={true}
          value={formData.rental_type}
          options={rentalTypes}
          onSelect={(v) => updateForm('rental_type', v)}
          placeholder="Select Rental Type"
        />

        {formData.rental_type === 'TRIP_BASIS' && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 mb-1">
              Number of Trips <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.number_of_trips}
              onChangeText={(t) => updateForm('number_of_trips', t)}
              className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5"
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        )}

        <View className="flex-row mb-4 gap-x-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Start Time</Text>
            <View className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 h-14">
              <Clock size={18} color="#94a3b8" className="mr-2" />
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => updateForm('start_time', e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}
                />
              ) : (
                <TextInput
                  value={formData.start_time}
                  onChangeText={(t) => updateForm('start_time', t)}
                  className="flex-1 text-slate-900 text-base font-medium"
                  placeholder="HH:MM"
                  placeholderTextColor="#94a3b8"
                />
              )}
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">End Time</Text>
            <View className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 h-14">
              <Clock size={18} color="#94a3b8" className="mr-2" />
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => updateForm('end_time', e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}
                />
              ) : (
                <TextInput
                  value={formData.end_time}
                  onChangeText={(t) => updateForm('end_time', t)}
                  className="flex-1 text-slate-900 text-base font-medium"
                  placeholder="HH:MM"
                  placeholderTextColor="#94a3b8"
                />
              )}
            </View>
          </View>
        </View>

        <View className="flex-row space-x-4 mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-medium text-slate-700 mb-1">Break Hours</Text>
            <TextInput
              value={formData.break_hours}
              onChangeText={(t) => updateForm('break_hours', t)}
              className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5"
              placeholder="1"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-sm font-medium text-slate-700 mb-1">Working Hours</Text>
            <TextInput
              value={formData.working_hours}
              onChangeText={(t) => updateForm('working_hours', t)}
              className="bg-slate-100 border border-slate-200 text-slate-900 font-bold rounded-lg px-4 py-3.5"
              editable={false}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Vehicle Number <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={formData.vehicle_number}
            onChangeText={(t) => updateForm('vehicle_number', t)}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5"
            placeholder="e.g. DXB 12345"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Foreman Name <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={formData.foreman_name}
            onChangeText={(t) => updateForm('foreman_name', t)}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5"
            placeholder="Name of Foreman"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Engineer Name <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={formData.engineer_name}
            onChangeText={(t) => updateForm('engineer_name', t)}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5"
            placeholder="Name of Engineer"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Photo Upload Section */}
        <View className="mb-6 bg-white border border-slate-200 rounded-lg p-4">
          <Text className="text-slate-700 text-sm font-medium mb-3">
            Equipment Photo <Text className="text-red-500">*</Text>
          </Text>
          
          {photoUri ? (
            <View className="mb-3">
              <View className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200">
                <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity 
                  onPress={() => setPhotoUri(null)}
                  className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => pickImage(true)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-4 flex-row items-center justify-center active:bg-slate-100"
              >
                <Camera size={20} color="#64748b" />
                <Text className="text-slate-700 ml-2 font-semibold">Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => pickImage(false)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-4 flex-row items-center justify-center active:bg-slate-100"
              >
                <ImageIcon size={20} color="#64748b" />
                <Text className="text-slate-700 ml-2 font-semibold">Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="mb-8">
          <Text className="text-sm font-medium text-slate-700 mb-1">Remarks (Optional)</Text>
          <TextInput
            value={formData.remarks}
            onChangeText={(t) => updateForm('remarks', t)}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3.5 min-h-[100px]"
            placeholder="Enter remarks (optional)"
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={submitting}
          className={`w-full py-4 rounded-xl flex-row justify-center items-center ${submitting ? 'bg-slate-400' : 'bg-[#1e3a8a]'}`}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">{id ? 'Update Entry' : 'Submit Entry'}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
