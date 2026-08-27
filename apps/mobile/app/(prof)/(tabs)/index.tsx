import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../../components/ScreenContainer';

export default function ProfessorHome() {
  return <ScreenContainer>
    <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
    <Text style={styles.title}>Bonjour Patrick</Text>
    <Text style={styles.caption}>Retrouvez vos classes, l’appel du jour et la saisie des notes.</Text>
    <View style={styles.grid}>
      <Pressable style={styles.card} onPress={() => router.push('/(prof)/(tabs)/appel')}><Text style={styles.icon}>✓</Text><Text style={styles.cardTitle}>Faire l’appel</Text><Text style={styles.meta}>6ème primaire A · maintenant</Text></Pressable>
      <Pressable style={styles.card} onPress={() => router.push('/(prof)/(tabs)/notes')}><Text style={styles.icon}>N</Text><Text style={styles.cardTitle}>Saisir les notes</Text><Text style={styles.meta}>Mathématiques · 1er trimestre</Text></Pressable>
    </View>
    <View style={styles.notice}><Text style={styles.noticeTitle}>Affectations actives</Text><Text style={styles.meta}>6ème primaire A et B · Mathématiques</Text></View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({ eyebrow: { color: '#7a5ba4', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: '#24114d', fontSize: 29, fontWeight: '800', marginTop: 6 }, caption: { color: '#756b84', fontSize: 14, lineHeight: 21 }, grid: { flexDirection: 'row', gap: 12 }, card: { backgroundColor: '#fff', borderRadius: 20, flex: 1, gap: 8, padding: 16 }, icon: { backgroundColor: '#f0e7ff', borderRadius: 12, color: '#630ed4', fontSize: 22, fontWeight: '800', padding: 8, textAlign: 'center', width: 46 }, cardTitle: { color: '#24114d', fontSize: 16, fontWeight: '800' }, meta: { color: '#756b84', fontSize: 13, lineHeight: 19 }, notice: { backgroundColor: '#efe9ff', borderRadius: 18, gap: 6, padding: 16 }, noticeTitle: { color: '#4e2d7a', fontSize: 15, fontWeight: '800' } });
