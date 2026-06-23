import type { ParentRelationship } from '@/core/domain/parent';
import { t } from '@/core/infra/i18n';

const RELATIONSHIP_KEYS: Record<ParentRelationship, string> = {
  Pai: 'relationships.father',
  Mãe: 'relationships.mother',
  Outro: 'relationships.other',
};

export function relationshipLabel(relationship: ParentRelationship | string): string {
  const key = RELATIONSHIP_KEYS[relationship as ParentRelationship];
  return key ? t(key) : relationship;
}
