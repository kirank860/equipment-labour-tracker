import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { Truck, Users, FileCheck2, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { getLocalDateString } from '../../lib/dateUtils';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    equipment: 0,
    labour: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchStats();
  }, [selectedDate]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const dateStr = getLocalDateString(selectedDate);
      
      const [eqRes, labRes] = await Promise.all([
        supabase.from('equipment_entries').select('status').eq('entry_date', dateStr),
        supabase.from('labour_entries').select('status').eq('entry_date', dateStr)
      ]);
      
      const eqData = eqRes.data || [];
      const labData = labRes.data || [];
      const allData = [...eqData, ...labData];
      
      setStats({
        equipment: eqData.length,
        labour: labData.length,
        pending: allData.filter(e => e.status === 'SUBMITTED').length,
        approved: allData.filter(e => e.status === 'APPROVED').length,
        rejected: allData.filter(e => e.status === 'REJECTED').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    const today = new Date();
    if (next <= today) setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = getLocalDateString(selectedDate) === getLocalDateString(new Date());

  const formatDate = (d: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const username = user?.email?.split('@')[0] || 'Foreman';
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header section */}
      <View className="bg-white px-6 pt-16 pb-8 rounded-b-[40px] shadow-lg border-b border-slate-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-slate-500 font-semibold tracking-wider text-xs uppercase">Welcome back,</Text>
            <Text className="text-slate-900 text-3xl font-black tracking-tight mt-1" numberOfLines={1}>
              {capitalizedUsername}
            </Text>
            <Text className="text-slate-400 font-medium text-sm mt-1">Foreman Dashboard</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center border border-blue-200 shadow-sm">
              <Text className="text-[#1e3a8a] text-xl font-black">{capitalizedUsername.charAt(0)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 pt-6 pb-32">
        {/* Date Navigator */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            {isToday ? "Today's Summary" : 'Summary'}
          </Text>
        </View>

        <View className="flex-row items-center justify-between bg-white rounded-2xl border border-slate-200 p-3 mb-6">
          <TouchableOpacity onPress={goToPrevDay} className="p-2 bg-slate-100 rounded-xl active:bg-slate-200">
            <ChevronLeft size={20} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} className="items-center px-4">
            <Text className="text-slate-900 font-black text-base tracking-tight">{formatDate(selectedDate)}</Text>
            {!isToday && (
              <Text className="text-blue-600 font-bold text-xs mt-1">Tap to go to Today</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={goToNextDay} 
            className={`p-2 rounded-xl ${isToday ? 'bg-slate-50' : 'bg-slate-100 active:bg-slate-200'}`}
            disabled={isToday}
          >
            <ChevronRight size={20} color={isToday ? '#cbd5e1' : '#334155'} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(app)/history', params: { date: getLocalDateString(selectedDate), type: 'EQUIPMENT' } })}
            className="w-[48%] bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 items-center active:opacity-80"
          >
            <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mb-3 border border-blue-100">
              <Truck size={22} color="#1e3a8a" />
            </View>
            {loadingStats ? <ActivityIndicator color="#1e3a8a" /> : <Text className="text-3xl font-black text-slate-900 tracking-tight">{stats.equipment}</Text>}
            <Text className="text-sm text-slate-500 font-medium mt-1">Equipment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(app)/history', params: { date: getLocalDateString(selectedDate), type: 'LABOUR' } })}
            className="w-[48%] bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 items-center active:opacity-80"
          >
            <View className="bg-emerald-50 w-12 h-12 rounded-full items-center justify-center mb-3 border border-emerald-100">
              <Users size={22} color="#059669" />
            </View>
            {loadingStats ? <ActivityIndicator color="#059669" /> : <Text className="text-3xl font-black text-slate-900 tracking-tight">{stats.labour}</Text>}
            <Text className="text-sm text-slate-500 font-medium mt-1">Labour</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(app)/history', params: { date: getLocalDateString(selectedDate), status: 'SUBMITTED' } })}
            className="w-[31%] bg-white py-4 px-2 rounded-[20px] shadow-sm border border-slate-100 items-center active:opacity-80"
          >
            <View className="bg-amber-50 w-10 h-10 rounded-full items-center justify-center mb-2 border border-amber-100">
              <Clock size={18} color="#d97706" />
            </View>
            {loadingStats ? <ActivityIndicator color="#d97706" /> : <Text className="text-2xl font-black text-slate-900 tracking-tight">{stats.pending}</Text>}
            <Text className="text-xs text-slate-500 font-semibold mt-1">Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(app)/history', params: { date: getLocalDateString(selectedDate), status: 'APPROVED' } })}
            className="w-[31%] bg-white py-4 px-2 rounded-[20px] shadow-sm border border-slate-100 items-center active:opacity-80"
          >
            <View className="bg-green-50 w-10 h-10 rounded-full items-center justify-center mb-2 border border-green-100">
              <FileCheck2 size={18} color="#16a34a" />
            </View>
            {loadingStats ? <ActivityIndicator color="#16a34a" /> : <Text className="text-2xl font-black text-slate-900 tracking-tight">{stats.approved}</Text>}
            <Text className="text-xs text-slate-500 font-semibold mt-1">Approved</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/(app)/history', params: { date: getLocalDateString(selectedDate), status: 'REJECTED' } })}
            className="w-[31%] bg-white py-4 px-2 rounded-[20px] shadow-sm border border-slate-100 items-center active:opacity-80"
          >
            <View className="bg-red-50 w-10 h-10 rounded-full items-center justify-center mb-2 border border-red-100">
              <FileCheck2 size={18} color="#dc2626" />
            </View>
            {loadingStats ? <ActivityIndicator color="#dc2626" /> : <Text className="text-2xl font-black text-slate-900 tracking-tight">{stats.rejected}</Text>}
            <Text className="text-xs text-slate-500 font-semibold mt-1">Rejected</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text className="text-slate-500 font-semibold text-xs uppercase tracking-wider mt-6 mb-4">Quick Actions</Text>
        
        <TouchableOpacity 
          className="bg-[#1e3a8a] flex-row items-center justify-center py-4 rounded-[20px] shadow-lg shadow-blue-900/20 mb-4 active:opacity-80"
          onPress={() => router.push('/(app)/entry/select')}
        >
          <Plus size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2 tracking-tight">New Daily Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white border border-slate-200 flex-row items-center justify-center py-4 rounded-[20px] active:bg-slate-50"
          onPress={() => router.push({ pathname: '/(app)/history', params: { date: getLocalDateString(selectedDate) } })}
        >
          <Clock size={24} color="#64748b" />
          <Text className="text-slate-700 font-bold text-lg ml-2 tracking-tight">View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
