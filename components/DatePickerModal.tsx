import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

interface DatePickerModalProps {
  visible: boolean;
  date: string; // YYYY-MM-DD
  onClose: () => void;
  onSelect: (date: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePickerModal({ visible, date, onClose, onSelect }: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    if (visible && date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentMonth(parsedDate);
      }
    }
  }, [visible, date]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots for padding the first row
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = date === currentDateString;
      
      const today = new Date();
      const localTodayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const isLocalToday = currentDateString === localTodayString;
      
      days.push(
        <View key={`day-${i}`} className="w-[14.28%] aspect-square p-1">
          <TouchableOpacity 
            onPress={() => {
              onSelect(currentDateString);
              onClose();
            }}
            className={`flex-1 items-center justify-center rounded-full ${isSelected ? 'bg-indigo-600 shadow-sm' : isLocalToday ? 'bg-indigo-50 border border-indigo-100' : 'bg-transparent active:bg-slate-50'}`}
          >
            <Text className={`text-sm ${isSelected ? 'text-white font-mono-bold' : isLocalToday ? 'text-indigo-600 font-mono-bold' : 'text-slate-700 font-outfit'}`}>
              {i}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-slate-900/40 p-4" style={Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } as any : {}}>
        <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />
        <View className="bg-white rounded-3xl w-full max-w-[340px] overflow-hidden shadow-2xl elevation-10">
          
          {/* Header */}
          <View className="bg-slate-950 p-6 flex-row justify-between items-center border-b border-slate-900">
            <View>
              <Text className="text-indigo-400 text-[10px] font-outfit-bold uppercase tracking-widest mb-1.5">Select Date</Text>
              <Text className="text-white text-2xl font-mono-bold tracking-tight">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-white/10 p-2.5 rounded-2xl active:bg-white/20">
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View className="p-5">
            {/* Controls */}
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={prevMonth} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl active:bg-slate-100">
                <ChevronLeft size={20} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date())} className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl active:bg-indigo-100">
                <Text className="text-indigo-600 font-outfit-bold text-[10px] uppercase tracking-widest">Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextMonth} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl active:bg-slate-100">
                <ChevronRight size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>
            
            {/* Days of Week */}
            <View className="flex-row mb-3">
              {DAYS.map(day => (
                <View key={day} className="w-[14.28%] items-center">
                  <Text className="text-slate-400 text-[9px] font-outfit-bold uppercase tracking-widest">{day}</Text>
                </View>
              ))}
            </View>
            
            {/* Calendar Grid */}
            <View className="flex-row flex-wrap">
              {renderCalendar()}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
