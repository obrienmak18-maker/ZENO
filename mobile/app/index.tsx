import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions, firebaseConfigured } from '../lib/firebase';
import { ScreenContainer } from '../components/ScreenContainer';

export default function EntryScreen() {
  const [manual, setManual] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Caméra nécessaire', 'Autorisez la caméra pour scanner le QR Code d’accès.');
        return;
      }
    }
    setScanning(true);
  };

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (!data || busy) return;
    setBusy(true);
    try {
      const payload = JSON.parse(data) as { tokenId?: string; schoolId?: string };
      if (!payload.tokenId || !payload.schoolId) throw new Error('QR invalide');
      if (functions) {
        const consume = httpsCallable(functions, 'consumeQrToken');
        await consume({ tokenId: payload.tokenId, schoolId: payload.schoolId });
      }
      router.replace('/dashboard');
    } catch {
      Alert.alert('QR Code refusé', 'Le code est invalide, expiré ou déjà utilisé.');
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Informations incomplètes', 'Saisissez un e-mail et un mot de passe de six caractères minimum.');
      return;
    }
    setBusy(true);
    try {
      if (auth) await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/dashboard');
    } catch {
      Alert.alert('Connexion impossible', 'Vérifiez vos identifiants Firebase.');
    } finally {
      setBusy(false);
    }
  };

  if (scanning) {
    return <View style={styles.scanner}><CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={busy ? undefined : handleScan} /><View style={styles.scannerShade}><Text style={styles.brand}>CLASSE</Text><View style={styles.scanFrame}><View style={styles.corner} /><View style={[styles.corner, styles.cornerRight]} /><View style={[styles.corner, styles.cornerBottom]} /><View style={[styles.corner, styles.cornerBottomRight]} /></View><Text style={styles.scanTitle}>Scannez votre QR Code</Text><Text style={styles.scanCaption}>Le code doit être actif et non expiré.</Text><Pressable style={styles.outlineButton} onPress={() => setScanning(false)}><Text style={styles.outlineLabel}>Annuler</Text></Pressable></View></View>;
  }

  return <ScreenContainer contentContainerStyle={styles.entryContent}><View style={styles.hero}><Text style={styles.brandDark}>CLASSE</Text><Text style={styles.portal}>Portail Établissement</Text><Text style={styles.headline}>La gestion scolaire, enfin simple.</Text><Text style={styles.subheadline}>Accédez aux élèves, présences, notes et paiements depuis votre téléphone.</Text></View><View style={styles.card}>{manual ? <><Text style={styles.cardTitle}>Connexion manuelle</Text><Text style={styles.cardCaption}>{firebaseConfigured ? 'Connexion sécurisée par Firebase Auth.' : 'Mode local de démonstration — Firebase sera utilisé dès qu’il sera configuré.'}</Text><TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Adresse e-mail" value={email} onChangeText={setEmail} style={styles.input} /><TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} /><Pressable disabled={busy} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, busy && styles.disabled]} onPress={submit}><Text style={styles.primaryLabel}>{busy ? 'Connexion…' : 'Se connecter'}</Text></Pressable><Pressable style={styles.linkButton} onPress={() => setManual(false)}><Text style={styles.linkLabel}>Retour au scan QR</Text></Pressable></> : <><Text style={styles.cardTitle}>Accès sécurisé</Text><Text style={styles.cardCaption}>Scannez le code fourni par votre établissement ou utilisez vos identifiants.</Text><Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={openScanner}><Text style={styles.primaryLabel}>Scanner un QR Code</Text></Pressable><Pressable style={styles.linkButton} onPress={() => setManual(true)}><Text style={styles.linkLabel}>Saisie manuelle</Text></Pressable></>}<Text style={styles.mode}>{firebaseConfigured ? 'Firebase Auth configuré' : 'Mode local sécurisé'}</Text></View><Text style={styles.help}>Besoin d’aide ? Contactez l’administration de votre établissement.</Text></ScreenContainer>;
}

const styles = StyleSheet.create({
  entryContent: { justifyContent: 'center', paddingVertical: 32 },
  hero: { gap: 8, marginBottom: 28 },
  brandDark: { color: '#24114d', fontSize: 38, fontWeight: '800', letterSpacing: 1 },
  portal: { color: '#765d9c', fontSize: 16, fontWeight: '600' },
  headline: { color: '#24114d', fontSize: 28, fontWeight: '800', lineHeight: 34, marginTop: 14 },
  subheadline: { color: '#756b84', fontSize: 15, lineHeight: 22, maxWidth: 360 },
  card: { backgroundColor: '#fff', borderRadius: 26, padding: 22, gap: 14, shadowColor: '#50358a', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  cardTitle: { color: '#24114d', fontSize: 20, fontWeight: '800' },
  cardCaption: { color: '#756b84', lineHeight: 20 },
  input: { backgroundColor: '#f7f4ff', borderColor: '#e6ddf6', borderRadius: 13, borderWidth: 1, color: '#24114d', padding: 14 },
  primaryButton: { alignItems: 'center', backgroundColor: '#630ed4', borderRadius: 14, padding: 15 },
  primaryLabel: { color: '#fff', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  linkButton: { alignItems: 'center', padding: 8 },
  linkLabel: { color: '#630ed4', fontWeight: '700' },
  mode: { color: '#8e829d', fontSize: 12, textAlign: 'center' },
  help: { color: '#8e829d', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  scanner: { backgroundColor: '#191420', flex: 1 },
  scannerShade: { alignItems: 'center', backgroundColor: 'rgba(20, 14, 32, .42)', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  brand: { color: '#fff', fontSize: 38, fontWeight: '800', letterSpacing: 1, marginBottom: 18 },
  scanFrame: { height: 260, position: 'relative', width: 260 },
  corner: { borderColor: '#994cff', borderLeftWidth: 4, borderTopWidth: 4, height: 42, left: 0, position: 'absolute', top: 0, width: 42 },
  cornerRight: { borderLeftWidth: 0, borderRightWidth: 4, left: undefined, right: 0 },
  cornerBottom: { borderBottomWidth: 4, borderTopWidth: 0, bottom: 0, top: undefined },
  cornerBottomRight: { borderBottomWidth: 4, borderLeftWidth: 0, borderRightWidth: 4, borderTopWidth: 0, bottom: 0, left: undefined, right: 0, top: undefined },
  scanTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  scanCaption: { color: '#e8dfff', fontSize: 14 },
  outlineButton: { borderColor: '#fff', borderRadius: 14, borderWidth: 1, marginTop: 10, paddingHorizontal: 28, paddingVertical: 12 },
  outlineLabel: { color: '#fff', fontWeight: '700' },
});
