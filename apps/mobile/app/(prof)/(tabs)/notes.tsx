import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import { enqueue } from '../../../lib/offlineQueue';
import { ScreenContainer } from '../../../components/ScreenContainer';

const initial = [{ id: 's1', name: 'Kevin Mukendi', value: '82' }, { id: 's2', name: 'Grace Ntumba', value: '71' }, { id: 's3', name: 'David Lumumba', value: '89' }, { id: 's4', name: 'Chantal Mbuyi', value: '58' }];
export default function NotesScreen() {
  const [rows, setRows] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const invalid = rows.some((row) => !Number.isFinite(Number(row.value)) || Number(row.value) < 0 || Number(row.value) > 100);
    if (invalid) { Alert.alert('Note invalide', 'Chaque note doit être comprise entre 0 et 100.'); return; }
    const payload = { rows: rows.map((row) => ({ id: `math-1-${row.id}`, eleveId: row.id, studentId: row.id, note: Number(row.value), coefficient: 2, trimestreId: 't1', trimester: '1er trimestre', matiereId: 'math', saisiParId: 'mobile-prof', estValide: false })) };
    setSaving(true);
    try {
      const callableFunctions = functions;
      if (callableFunctions) await Promise.all((payload.rows as Record<string, unknown>[]).map((row) => httpsCallable(callableFunctions, 'writeGrade')(row)));
      else await enqueue('writeGrade', payload);
      Alert.alert('Notes enregistrées', 'Les notes ont été prises en compte.');
    } catch { await enqueue('writeGrade', payload); Alert.alert('Mode hors connexion', 'Les notes sont conservées et seront synchronisées automatiquement.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer><Text style={styles.eyebrow}>NOTES</Text><Text style={styles.title}>Mathématiques</Text><Text style={styles.caption}>6ème primaire A · 1er trimestre · sur 100</Text>{rows.map((row) => <View key={row.id} style={styles.row}><Text style={styles.name}>{row.name}</Text><TextInput keyboardType="decimal-pad" value={row.value} onChangeText={(value) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, value } : item))} style={styles.input} /></View>)}<Pressable disabled={saving} style={styles.primary} onPress={save}><Text style={styles.primaryLabel}>{saving ? 'Enregistrement…' : 'Enregistrer les notes'}</Text></Pressable></ScreenContainer>;
}
const styles = StyleSheet.create({ eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 5 }, caption: { color: '#756b84', fontSize: 14 }, row: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', padding: 15 }, name: { color: '#24114d', flex: 1, fontSize: 15, fontWeight: '700' }, input: { backgroundColor: '#f7f4ff', borderColor: '#e6ddf6', borderRadius: 11, borderWidth: 1, color: '#24114d', fontSize: 16, fontWeight: '800', padding: 10, textAlign: 'center', width: 70 }, primary: { alignItems: 'center', backgroundColor: '#630ed4', borderRadius: 14, padding: 15 }, primaryLabel: { color: '#fff', fontWeight: '800' } });
