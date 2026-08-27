import { Tabs } from 'expo-router';
export default function AccountantTabsLayout() { return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0f9f78' }}><Tabs.Screen name="paiements" options={{ title: 'Paiements' }} /><Tabs.Screen name="debiteurs" options={{ title: 'Débiteurs' }} /><Tabs.Screen name="profil" options={{ title: 'Profil' }} /></Tabs>; }
