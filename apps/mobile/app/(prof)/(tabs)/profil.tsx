import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth, firebaseConfigured } from '../../../lib/firebase';
import { ScreenContainer } from '../../../components/ScreenContainer';

export default function ProfessorProfile() {
  const logout = async () => { if (auth) await signOut(auth); Alert.alert('Session fermée', 'Vous êtes déconnecté de CLASSE.'); router.replace('/'); };
  return <ScreenContainer><Text style={styles.eyebrow}>MON PROFIL</Text><Text style={styles.title}>Patrick Bahati</Text><Text style={styles.caption}>Professeur de Mathématiques</Text><View style={styles.card}><Text style={styles.label}>Affectations</Text><Text style={styles.value}>6ème primaire A et B</Text><Text style={styles.meta}>Mathématiques · année 2026–2027</Text></View><View style={styles.card}><Text style={styles.label}>Connexion</Text><Text style={styles.meta}>{firebaseConfigured ? 'Firebase Auth et synchronisation disponibles.' : 'Mode local : les opérations sont conservées sur cet appareil.'}</Text></View><Pressable style={styles.logout} onPress={logout}><Text style={styles.logoutLabel}>Se déconnecter</Text></Pressable></ScreenContainer>;
}
const styles = StyleSheet.create({ eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 5 }, caption: { color: '#756b84', fontSize: 14 }, card: { backgroundColor: '#fff', borderRadius: 18, gap: 7, padding: 17 }, label: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: .8, textTransform: 'uppercase' }, value: { color: '#24114d', fontSize: 16, fontWeight: '800' }, meta: { color: '#756b84', lineHeight: 19 }, logout: { alignItems: 'center', borderColor: '#e6c8d0', borderRadius: 14, borderWidth: 1, padding: 14 }, logoutLabel: { color: '#b22c4e', fontWeight: '800' } });
