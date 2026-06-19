import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateParentRequest, ParentId, UpdateParentRequest } from '@/core/domain/parent';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useFamily } from '@/presentation/providers/family';

import { CreateParentUseCase } from './create-parent.usecase';
import { ListParentsUseCase } from './list-parents.usecase';
import { UpdateParentUseCase } from './update-parent.usecase';

export function useParents(familyId: string | null, enabled = true) {
  const httpClient = HttpClientFactory.create();
  const useCase = new ListParentsUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.parents.list(familyId),
    queryFn: async () => {
      const response = await useCase.listMine();
      return response.items;
    },
    enabled: enabled && Boolean(familyId),
  });
}

export function useCreateParent() {
  const { familyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new CreateParentUseCase(httpClient);

  return useMutation({
    mutationFn: (data: CreateParentRequest) => useCase.createParent(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
    },
    meta: { familyId },
  });
}

export function useUpdateParent(parentId: ParentId) {
  const { familyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new UpdateParentUseCase(httpClient);

  return useMutation({
    mutationFn: (data: UpdateParentRequest) => useCase.updateParent(parentId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
    },
    meta: { familyId, parentId },
  });
}
