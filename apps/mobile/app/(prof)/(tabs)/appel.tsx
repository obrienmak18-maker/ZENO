import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import { enqueue, flushQueue } from '../../../lib/offlineQueue';
import { ScreenContainer } from '../../../components/ScreenContainer';

type Status = 'present' | 'late' | 'absent' | 'excused';
const students = [{ id: 's1', name: 'Kevin Mukendi' }, { id: 's2', name: 'Grace Ntumba' }, { id: 's3', name: 'David Lumumba' }, { id: 's4', name: 'Chantal Mbuyi' }];

export default function AttendanceScreen() {
  const [records, setRecords] = useState<Record<string, Status>>(() => Object.fromEntries(students.map((student) => [student.id, 'present'])));
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState(0);
  useEffect(() => { const callableFunctions = functions; if (!callableFunctions) return; void flushQueue(async (callable, payload) => { await httpsCallable(callableFunctions, callable)(payload); }).then((result) => setPending(result.pending)); }, []);
  const save = async () => {
    setSaving(true);
    const payload = { dateKey: new Date().toISOString().slice(0, 10), records: Object.entries(records).map(([studentId, status]) => ({ studentId, status, slotId: 'mobile-appel' })) };
    try {
      if (functions) await httpsCallable(functions, 'writeAttendanceBatch')(payload);
      else { await enqueue('writeAttendanceBatch', payload); setPending((value) => value + 1); }
      Alert.alert('Appel enregistré', pending ? 'L’appel est en attente de synchronisation.' : 'Les présences ont été enregistrées.');
    } catch { await enqueue('writeAttendanceBatch', payload); setPending((value) => value + 1); Alert.alert('Mode hors connexion', 'L’appel est conservé sur cet appareil et sera renvoyé automatiquement.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer><Text style={styles.eyebrow}>APPEL DU JOUR</Text><Text style={styles.title}>6ème primaire A</Text><Text style={styles.caption}>Mardi · Mathématiques · 08:00–10:00</Text>{students.map((student) => <View key={student.id} style={styles.row}><Text style={styles.name}>{student.name}</Text><View style={styles.statuses}>{(['present', 'late', 'absent', 'excused'] as Status[]).map((status) => <Pressable key={status} onPress={() => setRecords((current) => ({ ...current, [student.id]: status }))} style={[styles.status, records[student.id] === status && styles.selected]}><Text style={[styles.statusLabel, records[student.id] === status && styles.selectedLabel]}>{status === 'present' ? 'Présent' : status === 'late' ? 'Retard' : status === 'absent' ? 'Absent' : 'Excusé'}</Text></Pressable>)}</View></View>)}<Pressable disabled={saving} style={styles.primary} onPress={save}><Text style={styles.primaryLabel}>{saving ? 'Enregistrement…' : 'Enregistrer l’appel'}</Text></Pressable>{pending > 0 && <Text style={styles.pending}>{pending} opération(s) en attente de synchronisation</Text>}</ScreenContainer>;
}
const styles = StyleSheet.create({ eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 5 }, caption: { color: '#756b84', fontSize: 14 }, row: { backgroundColor: '#fff', borderRadius: 18, gap: 11, padding: 15 }, name: { color: '#24114d', fontSize: 15, fontWeight: '800' }, statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, status: { borderColor: '#e6ddf6', borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 7 }, selected: { backgroundColor: '#630ed4', borderColor: '#630ed4' }, statusLabel: { color: '#756b84', fontSize: 11, fontWeight: '700' }, selectedLabel: { color: '#fff' }, primary: { alignItems: 'center', backgroundColor: '#630ed4', borderRadius: 14, padding: 15 }, primaryLabel: { color: '#fff', fontWeight: '800' }, pending: { color: '#b16d00', fontSize: 12, textAlign: 'center' } });
