import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ScreenContainer } from '../components/ScreenContainer';

type Student = { id: string; code: string; name: string; className: string; status: string };
const seed: Student[] = [
  { id: '1', code: 'EL001', name: 'Kevin Mukendi', className: '6ème primaire A', status: 'Actif' },
  { id: '2', code: 'EL002', name: 'Grace Ntumba', className: '4ème primaire B', status: 'Actif' },
  { id: '3', code: 'EL003', name: 'David Lumumba', className: '6ème primaire A', status: 'Actif' },
  { id: '4', code: 'EL004', name: 'Chantal Mbuyi', className: '6ème primaire A', status: 'À compléter' },
];

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>(seed);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  useEffect(() => { AsyncStorage.getItem('classe-mobile-students').then((value) => value && setStudents(JSON.parse(value))); }, []);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const user = auth?.currentUser;
    if (!user || !db) return undefined;
    void user.getIdTokenResult().then((token) => {
      const schoolId = String(token.claims.school_id ?? process.env.EXPO_PUBLIC_FIREBASE_SCHOOL_ID ?? '');
      if (!schoolId) return;
      unsubscribe = onSnapshot(collection(db!, 'ecoles', schoolId, 'eleves'), (snapshot) => {
        const remote = snapshot.docs.map((item) => { const data = item.data(); return { id: item.id, code: String(data.codeUnique ?? data.code ?? item.id), name: String(data.nom ?? data.name ?? ''), className: String(data.classeId ?? data.className ?? ''), status: String(data.statut ?? data.status ?? 'Actif') }; });
        setStudents(remote);
        void AsyncStorage.setItem('classe-mobile-students', JSON.stringify(remote));
      });
    });
    return () => unsubscribe?.();
  }, []);
  const save = (next: Student[]) => { setStudents(next); void AsyncStorage.setItem('classe-mobile-students', JSON.stringify(next)); };
  const add = () => { if (!name.trim()) { Alert.alert('Nom requis', 'Saisissez le nom complet de l’élève.'); return; } const next = [...students, { id: String(Date.now()), code: `EL${String(students.length + 1).padStart(3, '0')}`, name: name.trim(), className: '6ème primaire A', status: 'Actif' }]; save(next); setName(''); setAdding(false); };
  return <ScreenContainer><Text style={styles.eyebrow}>ADMINISTRATION · ÉLÈVES</Text><Text style={styles.title}>Élèves</Text><Text style={styles.caption}>{students.length} dossier(s) conservé(s) sur cet appareil.</Text><Pressable style={styles.primaryButton} onPress={() => setAdding((value) => !value)}><Text style={styles.primaryLabel}>{adding ? 'Fermer' : 'Ajouter un élève'}</Text></Pressable>{adding && <View style={styles.form}><TextInput value={name} onChangeText={setName} placeholder="Nom complet" style={styles.input} /><Pressable style={styles.primaryButton} onPress={add}><Text style={styles.primaryLabel}>Enregistrer</Text></Pressable></View>}<View style={styles.list}>{students.map((student) => <View key={student.id} style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{student.name}</Text><Text style={styles.detail}>{student.code} · {student.className}</Text></View><Text style={[styles.status, student.status !== 'Actif' && styles.statusWarning]}>{student.status}</Text></View>)}</View></ScreenContainer>;
}

const styles = StyleSheet.create({
  eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 6 },
  caption: { color: '#756b84', fontSize: 14, marginBottom: 10, marginTop: 4 },
  primaryButton: { alignItems: 'center', backgroundColor: '#630ed4', borderRadius: 14, padding: 14 },
  primaryLabel: { color: '#fff', fontWeight: '800' },
  form: { backgroundColor: '#fff', borderRadius: 18, gap: 10, padding: 14 },
  input: { backgroundColor: '#f7f4ff', borderColor: '#e6ddf6', borderRadius: 12, borderWidth: 1, color: '#24114d', padding: 13 },
  list: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  row: { alignItems: 'center', borderBottomColor: '#eee7fa', borderBottomWidth: 1, flexDirection: 'row', gap: 11, padding: 14 },
  avatar: { alignItems: 'center', backgroundColor: '#eee5ff', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  avatarText: { color: '#630ed4', fontSize: 12, fontWeight: '800' },
  name: { color: '#24114d', fontSize: 14, fontWeight: '800' },
  detail: { color: '#8e829d', fontSize: 11, marginTop: 3 },
  status: { color: '#0f9f78', fontSize: 11, fontWeight: '800' },
  statusWarning: { color: '#c58200' },
});
