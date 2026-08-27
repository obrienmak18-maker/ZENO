import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../lib/firebase';
import { ScreenContainer } from '../../components/ScreenContainer';

export default function ScanAuthScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const scan = async ({ data }: BarcodeScanningResult) => {
    if (!data || busy || !functions || !auth) return;
    setBusy(true);
    try {
      const payload = JSON.parse(data) as { tokenId?: string; schoolId?: string };
      if (!payload.tokenId || !payload.schoolId) throw new Error('QR invalide');
      const result = await httpsCallable(functions, 'generateQRAuthToken')(payload);
      const customToken = (result.data as { customToken?: string }).customToken;
      if (!customToken) throw new Error('Token absent');
      await signInWithCustomToken(auth, customToken);
      router.replace('/dashboard');
    } catch { Alert.alert('QR Code refusé', 'Le code est invalide, expiré ou déjà utilisé.'); setBusy(false); }
  };
  if (!permission?.granted) return <ScreenContainer><Text style={styles.title}>Scanner le QR Code</Text><Text style={styles.caption}>La caméra est nécessaire pour ouvrir votre espace sécurisé.</Text><Pressable style={styles.primary} onPress={() => void requestPermission()}><Text style={styles.primaryLabel}>Autoriser la caméra</Text></Pressable><Pressable style={styles.link} onPress={() => router.replace('/')}><Text style={styles.linkLabel}>Retour</Text></Pressable></ScreenContainer>;
  return <View style={styles.scanner}><CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={busy ? undefined : scan} /><View style={styles.overlay}><Text style={styles.brand}>CLASSE</Text><View style={styles.frame} /><Text style={styles.captionLight}>Placez le QR Code au centre</Text><Pressable style={styles.outline} onPress={() => router.replace('/')}><Text style={styles.primaryLabel}>Annuler</Text></Pressable></View></View>;
}
const styles = StyleSheet.create({ title: { color: '#24114d', fontSize: 27, fontWeight: '800' }, caption: { color: '#756b84', fontSize: 14, lineHeight: 21 }, primary: { alignItems: 'center', backgroundColor: '#630ed4', borderRadius: 14, marginTop: 16, padding: 15 }, primaryLabel: { color: '#fff', fontWeight: '800' }, link: { alignItems: 'center', padding: 13 }, linkLabel: { color: '#630ed4', fontWeight: '800' }, scanner: { backgroundColor: '#191420', flex: 1 }, overlay: { alignItems: 'center', backgroundColor: 'rgba(20,14,32,.45)', flex: 1, gap: 16, justifyContent: 'center', padding: 24 }, brand: { color: '#fff', fontSize: 38, fontWeight: '800', letterSpacing: 1 }, frame: { borderColor: '#b06cff', borderRadius: 18, borderWidth: 3, height: 260, width: 260 }, captionLight: { color: '#fff', fontSize: 15 }, outline: { borderColor: '#fff', borderRadius: 14, borderWidth: 1, paddingHorizontal: 28, paddingVertical: 12 } });
