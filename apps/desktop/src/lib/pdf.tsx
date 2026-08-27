import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import { httpsCallable, type Functions } from 'firebase/functions';
import { getFirebaseStatus } from './firebase';

type PdfCloudContext = { functions: Functions; schoolId: string; studentId: string };
export type BulletinPdfInput = { studentId?: string; schoolName: string; schoolYear: string; studentName: string; className: string; trimester: string; average: number; rank: number; mention: string; grades: Array<{ subject: string; note: number; coefficient: number; appreciation?: string | null }> };

const styles = StyleSheet.create({ page: { color: '#1e293b', fontFamily: 'Helvetica', padding: 42 }, header: { borderBottomColor: '#7c3aed', borderBottomWidth: 3, marginBottom: 24, paddingBottom: 14 }, school: { color: '#7c3aed', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }, title: { fontSize: 24, fontWeight: 700, marginTop: 8 }, meta: { color: '#64748b', fontSize: 10, marginTop: 5 }, summary: { flexDirection: 'row', gap: 10, marginBottom: 22 }, metric: { backgroundColor: '#f5f0ff', borderRadius: 8, flex: 1, padding: 12 }, metricLabel: { color: '#64748b', fontSize: 9 }, metricValue: { color: '#5b21b6', fontSize: 18, fontWeight: 700, marginTop: 5 }, row: { borderBottomColor: '#e2e8f0', borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 8 }, cell: { flex: 1, fontSize: 10 }, note: { fontWeight: 700, textAlign: 'right' }, footer: { color: '#64748b', fontSize: 9, marginTop: 24 } });

function BulletinDocument({ input }: { input: BulletinPdfInput }) { return <Document><Page size="A4" style={styles.page}><View style={styles.header}><Text style={styles.school}>{input.schoolName}</Text><Text style={styles.title}>Bulletin scolaire</Text><Text style={styles.meta}>{input.schoolYear} · {input.trimester}</Text></View><Text style={{ fontSize: 13, fontWeight: 700 }}>{input.studentName}</Text><Text style={styles.meta}>{input.className}</Text><View style={styles.summary}><View style={styles.metric}><Text style={styles.metricLabel}>Moyenne générale</Text><Text style={styles.metricValue}>{input.average.toFixed(2)} / 100</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>Rang</Text><Text style={styles.metricValue}>{input.rank}</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>Mention</Text><Text style={styles.metricValue}>{input.mention}</Text></View></View><View>{input.grades.map((grade) => <View key={`${grade.subject}-${grade.note}`} style={styles.row}><Text style={styles.cell}>{grade.subject}</Text><Text style={[styles.cell, styles.note]}>{grade.note} / 100</Text><Text style={[styles.cell, { color: '#64748b', paddingLeft: 12 }]}>{grade.appreciation ?? ''}</Text></View>)}</View><Text style={styles.footer}>Document généré par CLASSE · La gestion scolaire avec style</Text></Page></Document>; }

async function buildPdf(input: BulletinPdfInput) { return pdf(<BulletinDocument input={input} />).toBlob(); }

export async function downloadBulletinPdf(input: BulletinPdfInput, cloud?: PdfCloudContext) {
  const blob = await buildPdf(input);
  let activeCloud = cloud;
  if (!activeCloud && input.studentId) {
    const status = getFirebaseStatus();
    if (status.functions && status.auth?.currentUser) { const claims = await status.auth.currentUser.getIdTokenResult(); const schoolId = String(claims.claims.school_id ?? ''); if (schoolId) activeCloud = { functions: status.functions, schoolId, studentId: input.studentId }; }
  }
  if (activeCloud && input.studentId) {
    const filename = `bulletin-${input.studentId}-${Date.now()}.pdf`;
    const signed = await httpsCallable<{ fileName: string; contentType: string; folder: string }, { objectPath: string; uploadUrl: string }>(activeCloud.functions, 'createStorageUploadUrl')({ fileName: filename, contentType: 'application/pdf', folder: 'bulletins' });
    const uploaded = await fetch(signed.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: blob });
    if (!uploaded.ok) throw new Error('Upload bulletin impossible');
    await httpsCallable(activeCloud.functions, 'registerDocumentMetadata')({ storagePath: signed.data.objectPath, ownerType: 'ELEVE', ownerId: input.studentId, anneeScolaireId: input.schoolYear, name: filename, contentType: 'application/pdf', size: blob.size });
  }
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `bulletin-${input.studentName.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.pdf`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
