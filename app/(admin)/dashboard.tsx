import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Truck, Users, CheckCircle, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();

  const [stats, setStats] = useState({
    pendingEquipment: 0,
    approvedEquipment: 0,
    pendingLabour: 0,
    approvedLabour: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app we might want to do count queries via RPC, but for now we fetch and count
      const { data: equipData } = await supabase.from('equipment_entries').select('status');
      const { data: labourData } = await supabase.from('labour_entries').select('status');

      let pe = 0, ae = 0, pl = 0, al = 0;

      equipData?.forEach(e => {
        if (e.status === 'SUBMITTED') pe++;
        if (e.status === 'APPROVED') ae++;
      });

      labourData?.forEach(l => {
        if (l.status === 'SUBMITTED') pl++;
        if (l.status === 'APPROVED') al++;
      });

      setStats({
        pendingEquipment: pe,
        approvedEquipment: ae,
        pendingLabour: pl,
        approvedLabour: al,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, iconColor, onPress }: any) => (
    <TouchableOpacity onPress={onPress} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 mx-2 mb-4 min-w-[200px] active:opacity-80">
      <View className="flex-row items-start justify-between mb-4">
        <View className={`${bgColorClass} p-3 rounded-xl`}>
          <Icon size={24} color={iconColor} />
        </View>
      </View>
      <Text className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</Text>
      <Text className={`text-4xl font-black ${colorClass}`}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className={`flex-1 bg-slate-50 ${isMobile ? 'p-4' : 'p-8'}`}>
      <View className="mb-8">
        <Text className="text-slate-900 text-3xl font-black tracking-tight">Dashboard Overview</Text>
        <Text className="text-slate-500 text-base mt-2">Welcome to the Truxo Admin Portal. Here is your daily summary.</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <View className="flex-row flex-wrap -mx-2">
          <StatCard 
            title="Pending Equipment" 
            value={stats.pendingEquipment} 
            icon={Clock} 
            colorClass="text-yellow-600"
            bgColorClass="bg-yellow-100"
            iconColor="#ca8a04"
            onPress={() => router.push({ pathname: '/(admin)/equipment', params: { filter: 'SUBMITTED' } })}
          />
          <StatCard 
            title="Approved Equipment" 
            value={stats.approvedEquipment} 
            icon={CheckCircle} 
            colorClass="text-green-600"
            bgColorClass="bg-green-100"
            iconColor="#16a34a"
            onPress={() => router.push({ pathname: '/(admin)/equipment', params: { filter: 'APPROVED' } })}
          />
          <StatCard 
            title="Pending Labour" 
            value={stats.pendingLabour} 
            icon={Clock} 
            colorClass="text-yellow-600"
            bgColorClass="bg-yellow-100"
            iconColor="#ca8a04"
            onPress={() => router.push({ pathname: '/(admin)/labour', params: { filter: 'SUBMITTED' } })}
          />
          <StatCard 
            title="Approved Labour" 
            value={stats.approvedLabour} 
            icon={CheckCircle} 
            colorClass="text-green-600"
            bgColorClass="bg-green-100"
            iconColor="#16a34a"
            onPress={() => router.push({ pathname: '/(admin)/labour', params: { filter: 'APPROVED' } })}
          />
        </View>
      )}
      
      {!loading && (stats.pendingEquipment === 0 && stats.pendingLabour === 0) && (
        <View className="mt-8 bg-green-50 p-6 rounded-2xl border border-green-200 items-center justify-center">
          <CheckCircle size={48} color="#16a34a" className="mb-4" />
          <Text className="text-green-900 text-xl font-bold">All caught up!</Text>
          <Text className="text-green-700 text-center mt-2">There are no pending entries requiring your approval.</Text>
        </View>
      )}
    </ScrollView>
  );
}
