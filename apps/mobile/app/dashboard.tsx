import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { router } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';

export default function DashboardScreen() {
  const [studentCount, setStudentCount] = useState('—');
  const [paymentCount, setPaymentCount] = useState('—');
  useEffect(() => {
    const user = auth?.currentUser;
    if (!user || !db) return undefined;
    let stopStudents: (() => void) | undefined;
    let stopPayments: (() => void) | undefined;
    void user.getIdTokenResult().then((token) => {
      const schoolId = String(token.claims.school_id ?? process.env.EXPO_PUBLIC_FIREBASE_SCHOOL_ID ?? '');
      if (!schoolId) return;
      stopStudents = onSnapshot(collection(db!, 'ecoles', schoolId, 'eleves'), (snapshot) => setStudentCount(String(snapshot.size)));
      stopPayments = onSnapshot(collection(db!, 'ecoles', schoolId, 'paiements'), (snapshot) => setPaymentCount(String(snapshot.size)));
    });
    return () => { stopStudents?.(); stopPayments?.(); };
  }, []);
  const stats = [
    { label: 'Élèves', value: studentCount, tone: '#630ed4' },
    { label: 'Présences', value: '—', tone: '#0f9f78' },
    { label: 'Paiements', value: paymentCount, tone: '#eea31b' },
  ];
  return <ScreenContainer><View style={styles.header}><View><Text style={styles.eyebrow}>ANNÉE 2026–2027 · ADMINISTRATEUR</Text><Text style={styles.title}>Aperçu général</Text><Text style={styles.caption}>Les priorités de votre établissement, en un coup d’œil.</Text></View><Pressable style={styles.avatar} onPress={() => router.push('/settings')}><Text style={styles.avatarText}>JK</Text></Pressable></View><View style={styles.stats}>{stats.map((stat) => <View key={stat.label} style={[styles.stat, { borderTopColor: stat.tone }]}><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text></View>)}</View><View style={styles.panel}><Text style={styles.eyebrow}>ACCÈS RAPIDE</Text><Text style={styles.panelTitle}>Que souhaitez-vous faire ?</Text><View style={styles.actions}><Action label="Gérer les élèves" detail="Dossiers et inscriptions" onPress={() => router.push('/students')} /><Action label="Générer un QR" detail="Accès temporaire sécurisé" onPress={() => router.push('/qr')} /><Action label="Voir les réglages" detail="École et session" onPress={() => router.push('/settings')} /></View></View><View style={styles.notice}><Text style={styles.noticeTitle}>À votre attention</Text><Text style={styles.noticeText}>3 appels non effectués et 8 dossiers élèves à compléter.</Text><Pressable onPress={() => router.push('/students')}><Text style={styles.link}>Ouvrir les dossiers</Text></Pressable></View></ScreenContainer>;
}

function Action({ label, detail, onPress }: { label: string; detail: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}><View style={styles.actionIcon}><Text style={styles.actionIconText}>›</Text></View><View style={{ flex: 1 }}><Text style={styles.actionLabel}>{label}</Text><Text style={styles.actionDetail}>{detail}</Text></View><Text style={styles.chevron}>›</Text></Pressable>; }

const styles = StyleSheet.create({
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: '#24114d', fontSize: 28, fontWeight: '800', marginTop: 6 },
  caption: { color: '#756b84', fontSize: 14, marginTop: 4 },
  avatar: { alignItems: 'center', backgroundColor: '#eee5ff', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: '#630ed4', fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { backgroundColor: '#fff', borderRadius: 16, borderTopWidth: 4, flex: 1, padding: 14 },
  statValue: { color: '#24114d', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#756b84', fontSize: 11, marginTop: 6 },
  panel: { backgroundColor: '#fff', borderRadius: 22, gap: 12, padding: 18 },
  panelTitle: { color: '#24114d', fontSize: 19, fontWeight: '800' },
  actions: { gap: 10 },
  action: { alignItems: 'center', backgroundColor: '#faf9ff', borderColor: '#eee7fa', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 11, padding: 12 },
  actionPressed: { opacity: 0.72 },
  actionIcon: { alignItems: 'center', backgroundColor: '#eee5ff', borderRadius: 10, height: 34, justifyContent: 'center', width: 34 },
  actionIconText: { color: '#630ed4', fontSize: 23, fontWeight: '700' },
  actionLabel: { color: '#24114d', fontSize: 14, fontWeight: '800' },
  actionDetail: { color: '#8e829d', fontSize: 12, marginTop: 2 },
  chevron: { color: '#630ed4', fontSize: 24 },
  notice: { backgroundColor: '#fff7e5', borderColor: '#f5dfae', borderRadius: 18, borderWidth: 1, gap: 7, padding: 16 },
  noticeTitle: { color: '#8b5b00', fontSize: 14, fontWeight: '800' },
  noticeText: { color: '#765e2a', lineHeight: 19 },
  link: { color: '#630ed4', fontWeight: '800' },
});
