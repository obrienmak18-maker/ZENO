import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth, firebaseConfigured } from '../lib/firebase';
import { ScreenContainer } from '../components/ScreenContainer';

export default function SettingsScreen() {
  const logout = async () => { if (auth) await signOut(auth); Alert.alert('Session fermée', 'Vous êtes déconnecté de CLASSE.'); router.replace('/'); };
  return <ScreenContainer><Text style={styles.eyebrow}>CONFIGURATION</Text><Text style={styles.title}>Réglages</Text><Text style={styles.caption}>Contrôlez votre session et l’état de connexion de l’établissement.</Text><View style={styles.card}><Text style={styles.label}>Compte actif</Text><Text style={styles.value}>Jean Kabeya</Text><Text style={styles.meta}>Administrateur · École CLASSE</Text></View><View style={styles.card}><Text style={styles.label}>Connexion</Text><View style={styles.statusRow}><View style={[styles.dot, { backgroundColor: firebaseConfigured ? '#0f9f78' : '#eea31b' }]} /><Text style={styles.value}>{firebaseConfigured ? 'Firebase Auth configuré' : 'Mode local sécurisé'}</Text></View><Text style={styles.meta}>{firebaseConfigured ? 'Les identifiants natifs utilisent le projet Firebase.' : 'Ajoutez les variables EXPO_PUBLIC_FIREBASE_* pour activer la session distante.'}</Text></View><Pressable style={styles.logout} onPress={logout}><Text style={styles.logoutLabel}>Se déconnecter</Text></Pressable></ScreenContainer>;
}

const styles = StyleSheet.create({ eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: .8 }, title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 6 }, caption: { color: '#756b84', fontSize: 14, lineHeight: 21, marginTop: 4 }, card: { backgroundColor: '#fff', borderRadius: 20, gap: 7, padding: 18 }, label: { color: '#7a5ba4', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }, value: { color: '#24114d', fontSize: 16, fontWeight: '800' }, meta: { color: '#756b84', lineHeight: 19 }, statusRow: { alignItems: 'center', flexDirection: 'row', gap: 8 }, dot: { borderRadius: 6, height: 12, width: 12 }, logout: { alignItems: 'center', borderColor: '#e6c8d0', borderRadius: 14, borderWidth: 1, padding: 14 }, logoutLabel: { color: '#b22c4e', fontWeight: '800' } });
