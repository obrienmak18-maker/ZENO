import { Tabs } from 'expo-router';

export default function ProfessorTabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#630ed4' }}>
    <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
    <Tabs.Screen name="appel" options={{ title: 'Appel' }} />
    <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
    <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
    <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
  </Tabs>;
}
