import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Modal, Platform, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { User, Mail, LogOut, Shield } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }, [])
  );

  const handleLogoutConfirm = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    if (user?.id) {
      // Admin might not have access to insert attendance logs but profile is for foremen
      await supabase.from('attendance_logs').insert({
        user_id: user.id,
        action: 'LOGOUT'
      });
    }

    await Promise.all([
      supabase.auth.signOut(),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    router.replace('/');
  };

  const username = user?.email?.split('@')[0] || 'Foreman';
  const role = user?.email?.includes('admin') ? 'Administrator' : 'Foreman';

  if (isTransitioning) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-6 py-5 border-b border-slate-200 bg-white flex-row justify-between items-center">
          <Text className="text-slate-900 text-3xl font-black tracking-tight">Profile</Text>
          <Image 
            source={require('../../assets/images/island_tower_logo.jpg')} 
            style={{ width: 40, height: 40, borderRadius: 8 }}
            resizeMode="contain" 
          />
        </View>

        <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 130 }}>
          {/* Avatar Section */}
          <View className="items-center mb-10">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm mb-4">
              <Text className="text-blue-900 text-4xl font-black">{username.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">{username.charAt(0).toUpperCase() + username.slice(1)}</Text>
            <View className="flex-row items-center mt-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Shield size={14} color="#64748b" />
              <Text className="text-slate-600 font-bold text-xs ml-1.5 uppercase tracking-wider">{role}</Text>
            </View>
          </View>

          {/* Details */}
          <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
            <View className="flex-row items-center mb-6">
              <View className="bg-slate-50 p-3 rounded-full border border-slate-100 mr-4">
                <User size={20} color="#64748b" />
              </View>
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Name</Text>
                <Text className="text-base font-bold text-slate-900">{username}</Text>
              </View>
            </View>

            <View className="h-px bg-slate-100 w-full mb-6" />

            <View className="flex-row items-center">
              <View className="bg-slate-50 p-3 rounded-full border border-slate-100 mr-4">
                <Mail size={20} color="#64748b" />
              </View>
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</Text>
                <Text className="text-base font-bold text-slate-900">{user?.email || 'No email provided'}</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={() => setShowLogoutModal(true)}
            className="flex-row items-center justify-center bg-red-50 border border-red-200 py-4 rounded-2xl active:bg-red-100 mt-auto"
          >
            <LogOut size={20} color="#dc2626" />
            <Text className="text-red-600 font-bold text-lg ml-2">Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Custom Logout Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 bg-slate-900/40 justify-center items-center px-6">
            <View className="bg-white w-full max-w-sm rounded-[32px] p-6 items-center shadow-2xl">
              <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4 border border-red-100">
                <LogOut size={28} color="#dc2626" />
              </View>
              <Text className="text-2xl font-black text-slate-900 mb-2 tracking-tight text-center">Sign Out</Text>
              <Text className="text-slate-500 text-center mb-8 font-medium leading-relaxed">
                Are you sure you want to sign out of your account?
              </Text>
              
              <View className="flex-row w-full">
                <TouchableOpacity 
                  onPress={() => setShowLogoutModal(false)}
                  className="flex-1 bg-slate-100 py-4 rounded-2xl mr-2 items-center active:bg-slate-200 border border-slate-200"
                >
                  <Text className="text-slate-700 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className={`flex-1 ${isLoggingOut ? 'bg-red-400' : 'bg-red-600'} py-4 rounded-2xl ml-2 items-center flex-row justify-center active:bg-red-700 shadow-sm shadow-red-200`}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Sign Out</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
