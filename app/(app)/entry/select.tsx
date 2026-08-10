import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Truck, Users, ArrowLeft, ChevronRight } from 'lucide-react-native';

export default function EntrySelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-slate-200 bg-white">
        <TouchableOpacity 
          onPress={() => router.replace('/(app)/home')}
          className="p-2 -ml-2 rounded-full active:opacity-60"
        >
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-2xl font-black tracking-tight ml-3">New Daily Entry</Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-8">
        <Text className="text-slate-500 text-sm font-semibold tracking-wider uppercase mb-8">Select Entry Type</Text>

        {/* Equipment Card */}
        <TouchableOpacity 
          onPress={() => router.push('/(app)/entry/equipment')}
          className="bg-white rounded-[28px] p-6 mb-6 border border-slate-200 shadow-xl active:scale-[0.98] active:opacity-80 transition-all flex-row items-center"
        >
          <View className="w-16 h-16 rounded-[20px] bg-blue-50 items-center justify-center mr-5 border border-blue-100">
            <Truck size={32} color="#1e3a8a" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 text-xl font-black tracking-tight mb-1">Equipment</Text>
            <Text className="text-slate-500 text-sm leading-relaxed">Log daily equipment usage, working hours, and rental details</Text>
          </View>
          <ChevronRight size={24} color="#94a3b8" />
        </TouchableOpacity>

        {/* Labour Card */}
        <TouchableOpacity 
          onPress={() => router.push('/(app)/entry/labour')}
          className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-xl active:scale-[0.98] active:opacity-80 transition-all flex-row items-center"
        >
          <View className="w-16 h-16 rounded-[20px] bg-green-50 items-center justify-center mr-5 border border-green-100">
            <Users size={32} color="#166534" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 text-xl font-black tracking-tight mb-1">Labour</Text>
            <Text className="text-slate-500 text-sm leading-relaxed">Log daily labour attendance, overtime, and work categories</Text>
          </View>
          <ChevronRight size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
