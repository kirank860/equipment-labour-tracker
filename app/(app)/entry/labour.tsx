import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator, Platform, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, ChevronDown, Clock, User, Briefcase, Calendar, Check, Camera, Image as ImageIcon, X, Users } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getLocalDateString } from '../../../lib/dateUtils';

type Job = { id: string; job_number: string; job_name: string };
type Supplier = { id: string; supplier_name: string };
type Designation = { id: string; designation_name: string };

export default function LabourEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  const [entryDate, setEntryDate] = useState(getLocalDateString());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakHours, setBreakHours] = useState('1');
  const [foremanName, setForemanName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [remarks, setRemarks] = useState('');

  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [designationModalVisible, setDesignationModalVisible] = useState(false);
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

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setFetching(true);
      const [jobsRes, suppliersRes, designationsRes, { data: { user } }] = await Promise.all([
        supabase.from('jobs').select('id, job_number, job_name').order('job_number'),
        supabase.from('suppliers').select('id, supplier_name').order('supplier_name'),
        supabase.from('labour_designations').select('id, designation_name').order('designation_name'),
        supabase.auth.getUser()
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);
      if (designationsRes.data) setDesignations(designationsRes.data);

      if (user) {
        const { data: userData } = await supabase.from('users').select('full_name, email').eq('id', user.id).maybeSingle();
        if (userData) {
          // If full_name is just "New User" from the trigger fallback, try to extract from email
          if (userData.full_name === 'New User' && userData.email) {
            setForemanName(userData.email.split('@')[0]);
          } else {
            setForemanName(userData.full_name || '');
          }
        }
      }

      if (id) {
        const { data: entryData } = await supabase.from('labour_entries').select('*').eq('id', id).single();
        if (entryData) {
          setEntryDate(entryData.entry_date);
          if (jobsRes.data) setSelectedJob(jobsRes.data.find((j: any) => j.id === entryData.job_id) || null);
          if (suppliersRes.data) setSelectedSupplier(suppliersRes.data.find((s: any) => s.id === entryData.supplier_id) || null);
          setEmployeeName(entryData.employee_name);
          if (designationsRes.data) setSelectedDesignation(designationsRes.data.find((d: any) => d.id === entryData.designation_id) || null);
          
          setStartTime(entryData.start_time ? entryData.start_time.substring(0, 5) : '08:00');
          setEndTime(entryData.end_time ? entryData.end_time.substring(0, 5) : '17:00');
          setBreakHours(entryData.break_hours ? entryData.break_hours.toString() : '1');
          setForemanName(entryData.foreman_name || '');
          setEngineerName(entryData.engineer_name || '');
          setRemarks(entryData.remarks || '');
          
          if (entryData.labour_photo_url && entryData.labour_photo_url !== 'pending') {
            setPhotoUri(entryData.labour_photo_url);
          }
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load form data');
    } finally {
      setFetching(false);
    }
  };

  const calculateTotalHours = () => {
    try {
      const start = startTime.split(':');
      const end = endTime.split(':');
      if (start.length === 2 && end.length === 2) {
        const startTotal = parseInt(start[0], 10) + parseInt(start[1], 10) / 60;
        const endTotal = parseInt(end[0], 10) + parseInt(end[1], 10) / 60;
        let diff = endTotal - startTotal;
        if (diff < 0) diff += 24;
        const brk = parseFloat(breakHours) || 0;
        const total = diff - brk;
        return total > 0 ? total.toFixed(2) : '0.00';
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return '0.00';
  };

  const totalWorkingHours = calculateTotalHours();

  const handleSubmit = async () => {
    if (!selectedJob || !selectedSupplier || !employeeName || !selectedDesignation || !startTime || !endTime || !foremanName) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      let uploadedPhotoUrl = 'pending';

      if (photoUri) {
        try {
          const fileName = `labour_${Date.now()}.jpg`;
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
        entry_date: entryDate,
        job_id: selectedJob.id,
        supplier_id: selectedSupplier.id,
        employee_name: employeeName,
        designation_id: selectedDesignation.id,
        start_time: startTime,
        end_time: endTime,
        break_hours: parseFloat(breakHours) || 0,
        total_working_hours: parseFloat(totalWorkingHours),
        foreman_name: foremanName,
        engineer_name: engineerName || null,
        labour_photo_url: uploadedPhotoUrl,
        remarks: remarks || null,
        created_by: userData?.user?.id || null,
        status: 'SUBMITTED',
        rejection_reason: null
      };

      let error;
      if (id) {
        const { error: updateError } = await supabase.from('labour_entries').update(payload).eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('labour_entries').insert(payload);
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
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to submit entry');
    } finally {
      setLoading(false);
    }
  };


  const renderModal = (
    visible: boolean, 
    setVisible: (v: boolean) => void, 
    data: any[], 
    keyExtractor: (item: any) => string, 
    onSelect: (item: any) => void, 
    title: string
  ) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-3xl h-[60%] border-t border-slate-200 shadow-2xl">
          <View className="flex-row items-center justify-between p-5 border-b border-slate-100">
            <Text className="text-slate-900 text-lg font-black tracking-tight">{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)} className="p-2 bg-slate-100 rounded-full active:opacity-60">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50"
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text className="text-slate-700 text-lg font-medium">
                  {item.supplier_name || item.designation_name || (item.job_number ? `${item.job_number} - ${item.job_name}` : '')}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </View>
    </Modal>
  );

  if (fetching) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#166534]">
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
          <Text className="text-white text-xl font-bold ml-2">Labour Supply Entry</Text>
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
              <Users size={64} color="#10b981" />
            </View>
            <Text className="text-2xl font-black text-slate-900 mb-2">Success!</Text>
            <Text className="text-slate-500 text-center mb-8">
              Your labour entry has been {id ? 'updated' : 'submitted'} successfully and is awaiting review.
            </Text>
            <TouchableOpacity 
              className="w-full bg-[#166534] rounded-xl py-4 items-center"
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
          <Users size={24} color="#166534" />
          <Text className="text-lg font-bold text-[#166534] ml-2">Labour Information</Text>
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
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}
              />
            ) : (
              <TextInput
                className="flex-1 text-slate-900 text-base font-medium"
                value={entryDate}
                onChangeText={setEntryDate}
                placeholder="YYYY-MM-DD"
              />
            )}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Job Number <Text className="text-red-500">*</Text>
          </Text>
          <TouchableOpacity 
            onPress={() => setJobModalVisible(true)}
            className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 py-3 h-14 active:opacity-70"
          >
            <View className="mr-3">
              <Briefcase size={20} color="#94a3b8" />
            </View>
            <Text className={`flex-1 text-base ${selectedJob ? 'text-slate-900' : 'text-slate-400'}`}>
              {selectedJob ? `${selectedJob.job_number} - ${selectedJob.job_name}` : 'Select Job'}
            </Text>
            <ChevronDown size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Supplier <Text className="text-red-500">*</Text>
          </Text>
          <TouchableOpacity 
            onPress={() => setSupplierModalVisible(true)}
            className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 py-3 h-14 active:opacity-70"
          >
            <View className="mr-3">
              <User size={20} color="#94a3b8" />
            </View>
            <Text className={`flex-1 text-base ${selectedSupplier ? 'text-slate-900' : 'text-slate-400'}`}>
              {selectedSupplier?.supplier_name || 'Select Supplier'}
            </Text>
            <ChevronDown size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Employee Name <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 h-14">
            <User size={20} color="#94a3b8" className="mr-3" />
            <TextInput
              className="flex-1 text-slate-900 text-base font-medium"
              placeholder="Enter employee name"
              placeholderTextColor="#94a3b8"
              value={employeeName}
              onChangeText={setEmployeeName}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Designation <Text className="text-red-500">*</Text>
          </Text>
          <TouchableOpacity 
            onPress={() => setDesignationModalVisible(true)}
            className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 py-3 h-14 active:opacity-70"
          >
            <View className="mr-3">
              <Briefcase size={20} color="#94a3b8" />
            </View>
            <Text className={`flex-1 text-base ${selectedDesignation ? 'text-slate-900' : 'text-slate-400'}`}>
              {selectedDesignation?.designation_name || 'Select Designation'}
            </Text>
            <ChevronDown size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-4 gap-x-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">
              Start Time <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 h-14">
              <Clock size={18} color="#94a3b8" className="mr-2" />
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}
                />
              ) : (
                <TextInput
                  className="flex-1 text-slate-900 text-base font-medium"
                  placeholder="08:00"
                  placeholderTextColor="#94a3b8"
                  value={startTime}
                  onChangeText={setStartTime}
                />
              )}
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">
              End Time <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-white border border-slate-300 rounded-lg px-4 h-14">
              <Clock size={18} color="#94a3b8" className="mr-2" />
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}
                />
              ) : (
                <TextInput
                  className="flex-1 text-slate-900 text-base font-medium"
                  placeholder="17:00"
                  placeholderTextColor="#94a3b8"
                  value={endTime}
                  onChangeText={setEndTime}
                />
              )}
            </View>
          </View>
        </View>

        <View className="flex-row mb-4 gap-x-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Break Hours</Text>
            <View className="bg-white border border-slate-300 rounded-lg px-4 h-14 justify-center">
              <TextInput
                className="flex-1 text-slate-900 text-base font-medium"
                placeholder="1"
                placeholderTextColor="#94a3b8"
                value={breakHours}
                onChangeText={setBreakHours}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 mb-1">Total Hours</Text>
            <View className="bg-slate-100 border border-slate-200 rounded-lg px-4 h-14 justify-center">
              <Text className="text-slate-900 text-base font-bold tracking-tight">{totalWorkingHours}</Text>
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">
            Foreman Name <Text className="text-red-500">*</Text>
          </Text>
          <View className="bg-white border border-slate-300 rounded-lg px-4 h-14 justify-center">
            <TextInput
              className="flex-1 text-slate-900 text-base"
              placeholder="Enter foreman name"
              placeholderTextColor="#94a3b8"
              value={foremanName}
              onChangeText={setForemanName}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-1">Engineer Name (Optional)</Text>
          <View className="bg-white border border-slate-300 rounded-lg px-4 h-14 justify-center">
            <TextInput
              className="flex-1 text-slate-900 text-base font-medium"
              placeholder="Enter engineer name"
              placeholderTextColor="#94a3b8"
              value={engineerName}
              onChangeText={setEngineerName}
            />
          </View>
        </View>

        <View className="mb-6 bg-white border border-slate-200 rounded-lg p-4">
          <Text className="text-slate-700 text-sm font-medium mb-3">Attach Timesheet Photo (Optional)</Text>
          
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
          <View className="bg-white border border-slate-300 rounded-lg px-4 py-3 min-h-[100px]">
            <TextInput
              className="flex-1 text-slate-900 text-base font-medium text-left"
              placeholder="Enter remarks (optional)"
              placeholderTextColor="#94a3b8"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-xl flex-row justify-center items-center ${loading ? 'bg-slate-400' : 'bg-[#1e3a8a]'}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">{id ? 'Update Entry' : 'Submit Entry'}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {renderModal(jobModalVisible, setJobModalVisible, jobs, (item) => item.id, setSelectedJob, 'Select Job')}
      {renderModal(supplierModalVisible, setSupplierModalVisible, suppliers, (item) => item.id, setSelectedSupplier, 'Select Supplier')}
      {renderModal(designationModalVisible, setDesignationModalVisible, designations, (item) => item.id, setSelectedDesignation, 'Select Designation')}
    </SafeAreaView>
  );
}
