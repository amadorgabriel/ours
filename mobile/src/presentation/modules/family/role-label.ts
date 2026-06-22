import type { FamilyWithRoleModel } from '@/core/domain/family';

export function roleLabel(role: FamilyWithRoleModel['role']): string {
  return role === 'Admin' ? 'Administrador' : 'Membro';
}
