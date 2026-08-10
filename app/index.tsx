import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Truck, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'FOREMAN' | 'ADMIN'>('FOREMAN');
  const [roleLoading, setRoleLoading] = useState(false);

  const handleRoleToggle = (role: 'FOREMAN' | 'ADMIN') => {
    if (role === selectedRole) return;
    setRoleLoading(true);
    setTimeout(() => {
      setSelectedRole(role);
      setRoleLoading(false);
    }, 400);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      // Append a pseudo-domain to allow Supabase to use its secure email/password auth 
      // while letting the user just type their username.
      const pseudoEmail = `${username.toLowerCase().trim()}@truxo.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pseudoEmail,
        password,
      });

      if (error) throw error;

      // Check role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle(); 
        
      if (userError) {
        console.error('Role check error:', userError);
      }

      let finalRole = 'FOREMAN';

      if (!userData) {
        // Auto-create profile with selected role
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: username,
          email: pseudoEmail,
          role: selectedRole
        });
        
        if (insertError && insertError.code !== '23505') {
          console.error('Auto-create profile failed:', insertError);
        }
        finalRole = selectedRole;
      } else {
        // Force update the role to what was selected
        await supabase.from('users').update({ role: selectedRole }).eq('id', data.user.id);
        finalRole = selectedRole;
      }

      if (finalRole === 'ADMIN') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(app)/home');
      }
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Login Failed', 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center items-center bg-slate-50 p-6"
    >
      <View className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
        <View className="items-center mb-8">
          <View className="bg-blue-50 p-5 rounded-[24px] mb-5 border border-blue-100">
            <Truck size={42} color="#1e3a8a" />
          </View>
          <Text className="text-3xl font-black text-slate-900 text-center tracking-tight">
            TRUXO
          </Text>
          <Text className="text-slate-500 mt-2 text-center font-medium">
            {selectedRole === 'ADMIN' ? 'Admin Portal' : 'Foreman Portal'}
          </Text>
        </View>

        <View className="space-y-5">
          <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-2">
            <TouchableOpacity 
              className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${selectedRole === 'FOREMAN' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => handleRoleToggle('FOREMAN')}
              disabled={roleLoading}
            >
              {roleLoading && selectedRole !== 'FOREMAN' ? (
                <ActivityIndicator size="small" color="#64748b" />
              ) : (
                <Text className={`font-bold ${selectedRole === 'FOREMAN' ? 'text-slate-900' : 'text-slate-500'}`}>Foreman</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${selectedRole === 'ADMIN' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => handleRoleToggle('ADMIN')}
              disabled={roleLoading}
            >
              {roleLoading && selectedRole !== 'ADMIN' ? (
                <ActivityIndicator size="small" color="#64748b" />
              ) : (
                <Text className={`font-bold ${selectedRole === 'ADMIN' ? 'text-slate-900' : 'text-slate-500'}`}>Admin</Text>
              )}
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-slate-500 mb-2 font-semibold text-xs uppercase tracking-wider">Username</Text>
            <TextInput
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 font-medium"
              placeholder="Enter your username"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-slate-500 mb-2 font-semibold text-xs uppercase tracking-wider">Password</Text>
            <View className="w-full bg-white border border-slate-200 rounded-2xl flex-row items-center pr-4">
              <TextInput
                className="flex-1 p-4 text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="p-2 -mr-2 active:opacity-60"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#94a3b8" />
                ) : (
                  <Eye size={20} color="#94a3b8" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            className={`w-full bg-[#1e3a8a] active:opacity-80 rounded-2xl p-4 mt-8 items-center flex-row justify-center shadow-lg shadow-blue-900/20 ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
