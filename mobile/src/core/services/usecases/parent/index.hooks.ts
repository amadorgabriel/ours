import { useQuery } from '@tanstack/react-query';

import type { FamilyId } from '@/core/domain/family';
import { queryKeys } from '@/core/infra/query/query-keys';

import { ListParentsUseCase } from './list-parents.usecase';

export function useParents(familyId: FamilyId | null, enabled = true) {
  const useCase = new ListParentsUseCase();

  return useQuery({
    queryKey: queryKeys.parents.list(familyId),
    queryFn: () => useCase.listMine(),
    enabled: enabled && Boolean(familyId),
  });
}
