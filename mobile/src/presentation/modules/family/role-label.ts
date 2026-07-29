import type { FamilyWithRoleModel } from '@/core/domain/family';
import { t } from '@/core/infra/i18n';

export function roleLabel(role: FamilyWithRoleModel['role']): string {
  return role === 'Admin' ? t('roles.admin') : t('roles.member');
}
