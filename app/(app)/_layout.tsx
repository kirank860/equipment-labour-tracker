import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Truck, Users, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="absolute left-4 right-4 bg-white shadow-xl shadow-slate-200/50 rounded-[28px] flex-row justify-between items-center px-2 py-2"
      style={{ bottom: Math.max(insets.bottom, 16), elevation: 10 }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        
        // Hide routes that shouldn't be in the tab bar (like entry forms)
        if (['entry/select', 'history'].includes(route.name)) return null;

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const Icon = options.tabBarIcon;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className={`flex-1 items-center justify-center py-2.5 rounded-[20px] ${isFocused ? 'bg-[#273b7a]' : 'bg-transparent'}`}
            style={{ maxWidth: 80 }}
          >
            {Icon && <Icon size={22} color={isFocused ? '#ffffff' : '#475569'} strokeWidth={isFocused ? 2.5 : 2} />}
            <Text 
              className={`text-[10px] mt-1.5 font-bold tracking-widest ${isFocused ? 'text-white' : 'text-slate-600'}`}
              style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', textAlign: 'center' }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
        tabBarHideOnKeyboard: true, // Prevents footer from floating above keyboard
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="entry/equipment" 
        options={{ 
          title: 'Equipment',
          tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="entry/labour" 
        options={{ 
          title: 'Labour',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
      
      {/* Hidden Screens inside the Tabs layout */}
      <Tabs.Screen name="entry/select" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}
