import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';

interface TimePickerModalProps {
  visible: boolean;
  time: string; // HH:mm (24-hour format)
  onClose: () => void;
  onSelect: (time24: string) => void;
}

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export default function TimePickerModal({ visible, time, onClose, onSelect }: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState('8');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  // Parse incoming 24h time string
  useEffect(() => {
    if (visible && time) {
      const [hStr, mStr] = time.split(':');
      let h = parseInt(hStr, 10);
      
      if (isNaN(h)) h = 8;
      
      const isPM = h >= 12;
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;

      setSelectedHour(hour12.toString());
      setSelectedMinute(mStr || '00');
      setAmpm(isPM ? 'PM' : 'AM');
    }
  }, [visible, time]);

  const handleSave = () => {
    let h24 = parseInt(selectedHour, 10);
    if (ampm === 'PM' && h24 !== 12) {
      h24 += 12;
    } else if (ampm === 'AM' && h24 === 12) {
      h24 = 0;
    }
    
    const h24Str = h24.toString().padStart(2, '0');
    onSelect(`${h24Str}:${selectedMinute}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-slate-900/40 p-4" style={Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } as any : {}}>
        <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />
        
        <View className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl elevation-10">
          {/* Header */}
          <View className="bg-slate-950 p-6 flex-row justify-between items-center border-b border-slate-900">
            <View>
              <Text className="text-indigo-400 text-[10px] font-outfit-bold uppercase tracking-widest mb-1.5">Select Time</Text>
              <Text className="text-white text-3xl font-mono-bold tracking-tight">
                {selectedHour.padStart(2, '0')}:{selectedMinute} {ampm}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-white/10 p-2.5 rounded-2xl active:bg-white/20">
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View className="p-6">
            
            {/* AM/PM Toggle */}
            <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-6">
              <TouchableOpacity 
                onPress={() => setAmpm('AM')}
                className={`flex-1 py-3 rounded-xl items-center ${ampm === 'AM' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              >
                <Text className={`font-outfit-bold tracking-widest ${ampm === 'AM' ? 'text-indigo-600' : 'text-slate-500'}`}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setAmpm('PM')}
                className={`flex-1 py-3 rounded-xl items-center ${ampm === 'PM' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              >
                <Text className={`font-outfit-bold tracking-widest ${ampm === 'PM' ? 'text-indigo-600' : 'text-slate-500'}`}>PM</Text>
              </TouchableOpacity>
            </View>

            {/* Hours Grid */}
            <Text className="text-slate-400 font-outfit-bold text-[10px] uppercase tracking-widest mb-3 ml-1">Hour</Text>
            <View className="flex-row flex-wrap justify-between mb-4">
              {HOURS.map(h => {
                const isSelected = selectedHour === h;
                return (
                  <TouchableOpacity 
                    key={`h-${h}`}
                    onPress={() => setSelectedHour(h)}
                    className={`w-[22%] aspect-square mb-3 items-center justify-center rounded-2xl ${isSelected ? 'bg-indigo-600 shadow-sm' : 'bg-slate-50 border border-slate-100'}`}
                  >
                    <Text className={`font-mono-bold text-lg ${isSelected ? 'text-white' : 'text-slate-700'}`}>{h}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Minutes Grid */}
            <Text className="text-slate-400 font-outfit-bold text-[10px] uppercase tracking-widest mb-3 ml-1">Minute</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <View className="flex-row items-center space-x-3 pb-2">
                {MINUTES.map(m => {
                  const isSelected = selectedMinute === m;
                  return (
                    <TouchableOpacity 
                      key={`m-${m}`}
                      onPress={() => setSelectedMinute(m)}
                      className={`w-14 h-14 items-center justify-center rounded-2xl ${isSelected ? 'bg-indigo-600 shadow-sm' : 'bg-slate-50 border border-slate-100'}`}
                    >
                      <Text className={`font-mono-bold text-lg ${isSelected ? 'text-white' : 'text-slate-700'}`}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity 
              onPress={handleSave}
              className="w-full bg-indigo-600 py-4 rounded-2xl items-center justify-center flex-row mt-4 active:bg-indigo-700"
            >
              <Check size={20} color="#ffffff" className="mr-2" />
              <Text className="text-white font-outfit-bold text-base tracking-wide">Set Time</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
}
