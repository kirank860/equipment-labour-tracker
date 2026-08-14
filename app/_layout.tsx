import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/auth';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { initialized, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(app)' || segments[0] === '(admin)';

    if (!user && inAuthGroup) {
      // Redirect to login if unauthenticated but trying to access protected routes
      router.replace('/');
    } else if (user && !inAuthGroup) {
      // If they are logged in but on the login screen, we don't know their role directly here.
      // They should sign in again, or we could fetch the role here and route them.
      // For simplicity, if they land on the login screen while logged in, let them click a 
      // "Continue to Dashboard" button which we will add to the login screen, or just log them out.
    }
  }, [user, initialized, segments]);

  if (!initialized) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
