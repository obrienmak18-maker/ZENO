import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';
import { enqueue } from '../../../lib/offlineQueue';
import { ScreenContainer } from '../../../components/ScreenContainer';

export default function PaymentsScreen() {
  const [studentId, setStudentId] = useState('s2');
  const [amount, setAmount] = useState('180000');
  const [method, setMethod] = useState('Mobile Money');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const parsed = Number(amount);
    if (!studentId.trim() || !Number.isFinite(parsed) || parsed <= 0) { Alert.alert('Informations incomplètes', 'Saisissez un élève et un montant positif.'); return; }
    const payload = { id: `mobile-${Date.now()}`, studentId: studentId.trim(), eleveId: studentId.trim(), amount: parsed, montantPaye: parsed, method, motif: 'Mensualité', date: new Date().toISOString(), school_id: 'mobile' };
    setSaving(true);
    try { if (functions) await httpsCallable(functions, 'recordPayment')(payload); else await enqueue('recordPayment', payload); Alert.alert('Paiement enregistré', 'Le reçu sera disponible dans l’espace comptable.'); }
    catch { await enqueue('recordPayment', payload); Alert.alert('Mode hors connexion', 'Le paiement est conservé et sera synchronisé automatiquement.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer><Text style={styles.eyebrow}>COMPTABILITÉ</Text><Text style={styles.title}>Nouveau paiement</Text><Text style={styles.caption}>Enregistrez un encaissement avec sa référence.</Text><View style={styles.card}><Text style={styles.label}>Identifiant élève</Text><TextInput value={studentId} onChangeText={setStudentId} style={styles.input} placeholder="Ex. EL002" /><Text style={styles.label}>Montant (CDF)</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" style={styles.input} /><Text style={styles.label}>Mode</Text><View style={styles.methods}>{['Espèces', 'Mobile Money', 'Virement'].map((item) => <Pressable key={item} style={[styles.method, method === item && styles.methodSelected]} onPress={() => setMethod(item)}><Text style={[styles.methodLabel, method === item && styles.methodSelectedLabel]}>{item}</Text></Pressable>)}</View><Pressable disabled={saving} style={styles.primary} onPress={save}><Text style={styles.primaryLabel}>{saving ? 'Enregistrement…' : 'Valider le paiement'}</Text></Pressable></View></ScreenContainer>;
}
const styles = StyleSheet.create({ eyebrow: { color: '#0f9f78', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: '#143c34', fontSize: 28, fontWeight: '800', marginTop: 5 }, caption: { color: '#617b72', fontSize: 14 }, card: { backgroundColor: '#fff', borderRadius: 20, gap: 10, padding: 18 }, label: { color: '#367a68', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }, input: { backgroundColor: '#f1faf7', borderColor: '#d9eee6', borderRadius: 12, borderWidth: 1, color: '#143c34', padding: 13 }, methods: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, method: { borderColor: '#d9eee6', borderRadius: 10, borderWidth: 1, padding: 9 }, methodSelected: { backgroundColor: '#0f9f78', borderColor: '#0f9f78' }, methodLabel: { color: '#617b72', fontSize: 12, fontWeight: '700' }, methodSelectedLabel: { color: '#fff' }, primary: { alignItems: 'center', backgroundColor: '#0f9f78', borderRadius: 14, marginTop: 4, padding: 15 }, primaryLabel: { color: '#fff', fontWeight: '800' } });
