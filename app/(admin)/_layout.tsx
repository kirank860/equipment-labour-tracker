import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Modal, SafeAreaView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Truck, Users, LayoutDashboard, LogOut, Settings, UserPlus, Menu, X, AlertTriangle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const NavItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
    const isActive = pathname === href;
    return (
      <TouchableOpacity 
        onPress={() => {
          router.push(href as any);
          if (isMobile) setMenuOpen(false);
        }}
        className={`flex-row items-center px-4 py-3 rounded-xl mb-2 ${isActive ? 'bg-blue-600' : 'active:bg-slate-800'}`}
      >
        <Icon size={20} color={isActive ? '#ffffff' : '#94a3b8'} />
        <Text className={`ml-3 font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const SidebarContent = () => (
    <View className="flex-1 bg-[#0f172a] flex-col py-8 px-4">
      <View className="flex-row items-center justify-between mb-10 px-2">
        <View className="flex-row items-center">
          <View className="bg-blue-600 p-2.5 rounded-xl mr-3 shadow-sm">
            <LayoutDashboard size={24} color="#ffffff" />
          </View>
          <View>
            <Text className="text-white text-2xl font-black tracking-tight">TRUXO</Text>
            <Text className="text-blue-400 text-xs font-bold uppercase tracking-widest">Admin Portal</Text>
          </View>
        </View>
        {isMobile && (
          <TouchableOpacity onPress={() => setMenuOpen(false)} className="p-2">
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 px-2">Menu</Text>
        <NavItem icon={LayoutDashboard} label="Dashboard" href="/(admin)/dashboard" />
        <NavItem icon={Truck} label="Equipment Entries" href="/(admin)/equipment" />
        <NavItem icon={Users} label="Labour Entries" href="/(admin)/labour" />
        <NavItem icon={Settings} label="Master Data" href="/(admin)/settings" />
        <NavItem icon={UserPlus} label="Employees" href="/(admin)/employees" />
      </View>

      <View className="mt-auto">
        <View className="h-px bg-slate-800 mb-4" />
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center px-4 py-3 rounded-xl active:bg-slate-800"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="ml-3 font-semibold text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 flex-row bg-slate-50">
      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center p-8">
          <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl items-center">
            <View className="bg-red-100 p-4 rounded-full mb-4">
              <AlertTriangle size={32} color="#ef4444" />
            </View>
            <Text className="text-xl font-black text-slate-900 mb-2">Logout?</Text>
            <Text className="text-slate-500 text-center mb-6">Are you sure you want to logout from the admin portal?</Text>
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center active:bg-slate-200"
              >
                <Text className="text-slate-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                className="flex-1 bg-red-500 py-3 rounded-xl items-center active:bg-red-600"
              >
                <Text className="text-white font-bold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <View className="w-64 border-r border-slate-800 bg-[#0f172a]">
          <SidebarContent />
        </View>
      )}

      {/* Main Content Area */}
      <View className="flex-1 flex-col">
        {/* Mobile Header */}
        {isMobile && (
          <View className="bg-[#0f172a] flex-row items-center justify-between p-4 pt-10">
            <TouchableOpacity onPress={() => setMenuOpen(true)} className="flex-row items-center active:opacity-80">
              <View className="bg-blue-600 p-2 rounded-lg mr-2 shadow-sm">
                <LayoutDashboard size={20} color="#ffffff" />
              </View>
              <Text className="text-white text-xl font-black tracking-tight">TRUXO</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuOpen(true)} className="p-2 active:opacity-80">
              <Menu size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        <Slot />
      </View>

      {/* Mobile Menu Modal */}
      {isMobile && (
        <Modal visible={menuOpen} animationType="slide" transparent={false}>
          <View className="flex-1 bg-[#0f172a] pt-10">
            <SidebarContent />
          </View>
        </Modal>
      )}
    </View>
  );
}
