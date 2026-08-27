import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { registerNotifications } from '../lib/notifications';
import { auth, functions } from '../lib/firebase';
import { installQueueReplay } from '../lib/offlineQueue';
import { httpsCallable } from 'firebase/functions';
import { onAuthStateChanged } from 'firebase/auth';
import '../global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => { void registerNotifications().catch(() => undefined); }, []);
  useEffect(() => { if (!functions) return; return installQueueReplay(async (callable, payload) => { await httpsCallable(functions!, callable)(payload); }); }, []);
  useEffect(() => { if (!auth || !functions) return; return onAuthStateChanged(auth, (user) => { if (!user) return; void registerNotifications().then((token) => { if (token) return httpsCallable(functions!, 'registerDeviceToken')({ token, platform: 'expo' }); return undefined; }).catch(() => undefined); }); }, []);
  return <SafeAreaProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></SafeAreaProvider>;
}
