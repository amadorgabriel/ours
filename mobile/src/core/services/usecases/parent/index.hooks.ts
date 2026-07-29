import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateParentRequest,
  ParentId,
  ParentSummary,
  UpdateParentPhotoRequest,
  UpdateParentRequest,
} from '@/core/domain/parent';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useFamily } from '@/presentation/providers/family';

import { CreateParentUseCase } from './create-parent.usecase';
import { GetParentUseCase } from './get-parent.usecase';
import { ListParentsUseCase } from './list-parents.usecase';
import { UpdateParentUseCase } from './update-parent.usecase';
import { UpdateParentPhotoUseCase } from './update-parent-photo.usecase';

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

export function useParent(parentId: ParentId | null, enabled = true) {
  const { familyId } = useFamily();
  const httpClient = HttpClientFactory.create();
  const useCase = new GetParentUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.parents.detail(familyId, parentId ?? 'none'),
    queryFn: () => useCase.getParent(parentId!),
    enabled: enabled && Boolean(familyId) && Boolean(parentId),
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
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.parents.detail(familyId, parentId),
        updated
      );

      queryClient.setQueryData<ParentSummary[]>(
        queryKeys.parents.list(familyId),
        (items) =>
          items?.map((item) => (item.id === parentId ? { ...item, ...updated } : item))
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
    },
    meta: { familyId, parentId },
  });
}

export function useUpdateParentPhoto(parentId: ParentId) {
  const { familyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new UpdateParentPhotoUseCase(httpClient);

  return useMutation({
    mutationFn: (data: UpdateParentPhotoRequest) => useCase.updatePhoto(parentId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
    },
    meta: { familyId, parentId },
  });
}