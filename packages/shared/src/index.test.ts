import { describe, expect, it } from 'vitest';
import { canAccessAssignment, calculerMoyenne, determinerMention, summarizeImportRows } from './index';

describe('contrats métier partagés', () => {
  it('calcule une moyenne pondérée et une mention', () => {
    const moyenne = calculerMoyenne([{ note: 80, coefficient: 2 }, { note: 60, coefficient: 1 }]);
    expect(moyenne).toBe(73.33);
    expect(determinerMention(moyenne)).toBe('DISTINCTION');
  });
  it('limite un enseignant à son affectation active', () => {
    const assignment = { active: true, classeIds: ['c1'], matiereIds: ['math'], anneeScolaireId: '2026' };
    expect(canAccessAssignment(assignment, 'c1', 'math', '2026')).toBe(true);
    expect(canAccessAssignment(assignment, 'c2', 'math', '2026')).toBe(false);
  });
  it('détecte les lignes incomplètes et doublons avant import', () => {
    expect(summarizeImportRows([{ codeUnique: 'EL001', nom: 'A' }, { codeUnique: 'EL001', nom: 'B' }, { codeUnique: 'EL002' }])).toEqual({ detected: 3, ready: 1, incomplete: 1, duplicates: 1 });
  });
});
