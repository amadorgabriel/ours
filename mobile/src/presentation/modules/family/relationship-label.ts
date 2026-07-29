import type { ParentRelationship } from '@/core/domain/parent';
import { t } from '@/core/infra/i18n';

const RELATIONSHIP_KEYS: Record<ParentRelationship, string> = {
  Pai: 'relationships.father',
  Mãe: 'relationships.mother',
  'Avô(a)': 'relationships.grandparentInclusive',
  'Tio(a)': 'relationships.uncleInclusive',
  'Irmão(a)': 'relationships.siblingInclusive',
  'Primo(a)': 'relationships.cousinInclusive',
  Cônjuge: 'relationships.spouse',
  Outro: 'relationships.other',
};

const LEGACY_RELATIONSHIP_KEYS: Record<string, string> = {
  Avô: 'relationships.grandfather',
  Avó: 'relationships.grandmother',
  Tio: 'relationships.uncle',
  Tia: 'relationships.aunt',
  Irmão: 'relationships.brother',
  Irmã: 'relationships.sister',
  Primo: 'relationships.cousinInclusive',
  Prima: 'relationships.cousinInclusive',
};

export function relationshipLabel(relationship: ParentRelationship | string): string {
  const key =
    RELATIONSHIP_KEYS[relationship as ParentRelationship] ?? LEGACY_RELATIONSHIP_KEYS[relationship];
  return key ? t(key) : relationship;
}
