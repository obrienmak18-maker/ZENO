import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BookOpen, CheckCircle2, Clock3 } from 'lucide-react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../../lib/firebase';
import { enqueue } from '../../../lib/offlineQueue';
import { ScreenContainer } from '../../../components/ScreenContainer';

type NoteRow = { id: string; name: string; value: string; appreciation: string; status: 'idle' | 'pending' | 'saved' | 'error' };

export default function NotesScreen() {
  const [rows, setRows] = useState<NoteRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [trimesterId, setTrimesterId] = useState('');
  const [contextOptions, setContextOptions] = useState({ classes: [] as string[], subjects: [] as string[], trimesters: [] as string[] });
  const debounceTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    let stop: () => void = () => undefined;
    const load = async () => {
      if (!db || !auth?.currentUser) return;
      const claims = await auth.currentUser.getIdTokenResult();
      const schoolId = String(claims.claims.school_id ?? '');
      if (!schoolId) return;
      stop = onSnapshot(collection(db, 'ecoles', schoolId, 'eleves'), (snapshot) => {
        const students = snapshot.docs.map((item) => { const data = item.data(); return { id: item.id, name: String(data.name ?? data.nom ?? data.codeUnique ?? item.id), value: String(data.note ?? ''), appreciation: String(data.appreciation ?? ''), status: 'idle' as const }; });
        setRows(students);
        setContextOptions((current) => ({ ...current, classes: Array.from(new Set(snapshot.docs.map((item) => String(item.data().classeId ?? item.data().className ?? '')).filter(Boolean))) }));
      }, () => setRows([]));
    };
    void load();
    return () => stop();
  }, []);

  const payloadFor = (row: NoteRow) => ({ id: `${subjectId || 'subject'}-${trimesterId || 'trimester'}-${row.id}`, eleveId: row.id, studentId: row.id, note: Number(row.value), coefficient: 1, trimestreId: trimesterId || 'trimestre-actif', trimester: trimesterId || 'trimestre-actif', matiereId: subjectId || 'matiere-active', classeId: classId || 'classe-affectee', appreciation: row.appreciation.trim(), saisiParId: auth?.currentUser?.uid ?? 'offline', estValide: false });

  const saveRow = async (row: NoteRow) => {
    const value = Number(row.value);
    if (!Number.isFinite(value) || value < 0 || value > 100) { setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: 'error' } : item)); return; }
    const payload = payloadFor(row);
    try {
      if (functions) await httpsCallable(functions, 'writeGrade')(payload);
      else await enqueue('writeGrade', payload);
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: 'saved' } : item));
    } catch { await enqueue('writeGrade', payload); setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: 'pending' } : item)); }
  };

  const updateRow = (id: string, patch: Partial<NoteRow>) => {
    setRows((current) => current.map((item) => item.id === id ? { ...item, ...patch, status: 'pending' } : item));
    const existing = debounceTimers.current.get(id); if (existing) clearTimeout(existing);
    debounceTimers.current.set(id, setTimeout(() => { const currentRow = rows.find((item) => item.id === id); if (currentRow) void saveRow({ ...currentRow, ...patch, status: 'pending' }); }, 500));
  };

  useEffect(() => () => { debounceTimers.current.forEach(clearTimeout); }, []);
  const invalidCount = useMemo(() => rows.filter((row) => row.value !== '' && (!Number.isFinite(Number(row.value)) || Number(row.value) < 0 || Number(row.value) > 100)).length, [rows]);
  const saveAll = async () => { if (invalidCount) { Alert.alert('Notes invalides', 'Chaque note doit être comprise entre 0 et 100.'); return; } setSaving(true); await Promise.all(rows.filter((row) => row.value !== '').map(saveRow)); setSaving(false); Alert.alert('Notes enregistrées', 'Les notes ont été prises en compte ou placées en attente de synchronisation.'); };

  return <ScreenContainer><View style={styles.heading}><View><Text style={styles.eyebrow}>NOTES</Text><Text style={styles.title}>Saisie des notes</Text><Text style={styles.caption}>Les élèves et affectations proviennent de votre école.</Text></View><BookOpen color="#630ed4" size={28} /></View><View style={styles.filters}><TextInput value={classId} onChangeText={setClassId} placeholder={contextOptions.classes[0] || 'Classe affectée'} style={styles.filter} /><TextInput value={subjectId} onChangeText={setSubjectId} placeholder="Matière" style={styles.filter} /><TextInput value={trimesterId} onChangeText={setTrimesterId} placeholder="Trimestre" style={styles.filter} /></View>{!rows.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>Aucun élève disponible</Text><Text style={styles.emptyText}>Vérifiez l’école, l’affectation et la connexion avant de saisir les notes.</Text></View> : <FlatList data={rows} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={styles.row}><View style={styles.student}><Text style={styles.name}>{item.name}</Text><TextInput keyboardType="decimal-pad" value={item.value} onChangeText={(value) => updateRow(item.id, { value })} placeholder="—" style={styles.input} /><TextInput value={item.appreciation} onChangeText={(appreciation) => updateRow(item.id, { appreciation })} placeholder="Appréciation" style={styles.appreciation} /></View><View style={styles.state}>{item.status === 'saved' ? <CheckCircle2 color="#0f9f78" size={17} /> : item.status === 'pending' ? <Clock3 color="#f59e0b" size={17} /> : null}<Text style={styles.stateText}>{item.status === 'saved' ? 'Enregistrée' : item.status === 'pending' ? 'En attente' : item.status === 'error' ? 'À corriger' : ''}</Text></View></View>} />}{rows.length > 0 && <Pressable disabled={saving} style={styles.primary} onPress={saveAll}><Text style={styles.primaryLabel}>{saving ? 'Enregistrement…' : 'Enregistrer les notes'}</Text></Pressable>}</ScreenContainer>;
}

const styles = StyleSheet.create({ heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 5 }, caption: { color: '#756b84', fontSize: 14, marginTop: 4 }, filters: { gap: 8, marginVertical: 16 }, filter: { backgroundColor: '#fff', borderColor: '#e6ddf6', borderRadius: 12, borderWidth: 1, color: '#24114d', padding: 11 }, list: { gap: 10, paddingBottom: 90 }, row: { backgroundColor: '#fff', borderRadius: 18, padding: 14 }, student: { alignItems: 'center', flexDirection: 'row', gap: 8 }, name: { color: '#24114d', flex: 1, fontSize: 15, fontWeight: '700' }, input: { backgroundColor: '#f7f4ff', borderColor: '#e6ddf6', borderRadius: 11, borderWidth: 1, color: '#24114d', fontSize: 16, fontWeight: '800', padding: 10, textAlign: 'center', width: 65 }, appreciation: { backgroundColor: '#f7f4ff', borderColor: '#e6ddf6', borderRadius: 11, borderWidth: 1, color: '#756b84', flex: 1, padding: 10 }, state: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 8 }, stateText: { color: '#756b84', fontSize: 12 }, primary: { alignItems: 'center', backgroundColor: '#630ed4', borderRadius: 14, padding: 15 }, primaryLabel: { color: '#fff', fontWeight: '800' }, empty: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 26 }, emptyTitle: { color: '#24114d', fontSize: 17, fontWeight: '800' }, emptyText: { color: '#756b84', lineHeight: 20, marginTop: 8, textAlign: 'center' } });
