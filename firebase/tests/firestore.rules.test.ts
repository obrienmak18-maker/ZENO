import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'classe-rules-test',
    firestore: { host: '127.0.0.1', port: 8080 },
  });
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('ecoles/ecole-a/eleves/e1').set({ school_id: 'ecole-a', id: 'e1', nom: 'Élève A' });
    await context.firestore().doc('ecoles/ecole-b/eleves/e1').set({ school_id: 'ecole-b', id: 'e1', nom: 'Élève B' });
    await context.firestore().doc('ecoles/ecole-a/affectations/prof-a').set({ school_id: 'ecole-a', profileId: 'prof-a', classeIds: ['c1'], matiereIds: ['math'], active: true });
  });
});

afterAll(async () => { await testEnv?.cleanup(); });

describe('règles Firestore CLASSE', () => {
  it('isole les écoles entre elles', async () => {
    const teacher = testEnv.authenticatedContext('prof-a', { school_id: 'ecole-a', role: 'PROFESSEUR' });
    await assertSucceeds(teacher.firestore().doc('ecoles/ecole-a/eleves/e1').get());
    await assertFails(teacher.firestore().doc('ecoles/ecole-b/eleves/e1').get());
  });

  it('refuse une écriture professeur sans affectation', async () => {
    const teacher = testEnv.authenticatedContext('prof-b', { school_id: 'ecole-a', role: 'PROFESSEUR' });
    await assertFails(teacher.firestore().doc('ecoles/ecole-a/presences/attendance-1').set({ school_id: 'ecole-a', studentId: 'e1', status: 'present' }));
  });

  it('autorise une présence pour un professeur affecté', async () => {
    const teacher = testEnv.authenticatedContext('prof-a', { school_id: 'ecole-a', role: 'PROFESSEUR' });
    await assertSucceeds(teacher.firestore().doc('ecoles/ecole-a/presences/attendance-2').set({ school_id: 'ecole-a', studentId: 'e1', classeId: 'c1', matiereId: 'math', status: 'present' }));
  });

  it('refuse une classe ou matière hors affectation', async () => {
    const teacher = testEnv.authenticatedContext('prof-a', { school_id: 'ecole-a', role: 'PROFESSEUR' });
    await assertFails(teacher.firestore().doc('ecoles/ecole-a/presences/attendance-3').set({ school_id: 'ecole-a', studentId: 'e1', classeId: 'c2', matiereId: 'math', status: 'present' }));
  });

  it('empêche une élévation de périmètre par school_id', async () => {
    const admin = testEnv.authenticatedContext('admin-a', { school_id: 'ecole-a', role: 'ADMINISTRATEUR' });
    await assertFails(admin.firestore().doc('ecoles/ecole-b/classes/c1').set({ school_id: 'ecole-a', nom: 'Classe étrangère' }));
    expect(true).toBe(true);
  });
});
