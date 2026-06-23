import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import type { AuthSessionModel } from '@/core/domain/auth';
import type {
  CreateFamilyRequest,
  CreateInviteRequest,
  DeleteFamilyRequest,
  FamilyId,
  JoinFamilyRequest,
  UpdateFamilyRequest,
} from '@/core/domain/family';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import type { IHttpClient } from '@/core/infra/http/index.types';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';

import { applyActiveFamilyFromSession } from '../auth/apply-active-family';
import { AuthGetSessionUseCase } from '../auth/get-session.usecase';
import { CreateFamilyUseCase } from './create-family.usecase';
import { CreateInviteUseCase } from './create-invite.usecase';
import { DeleteFamilyUseCase } from './delete-family.usecase';
import { JoinFamilyUseCase } from './join-family.usecase';
import { ListFamiliesUseCase } from './list-families.usecase';
import { UpdateFamilyUseCase } from './update-family.usecase';
import { ListFamilyMembersUseCase } from './list-family-members.usecase';
import { RemoveFamilyMemberUseCase } from './remove-family-member.usecase';

async function refreshAuthSession(
  httpClient: IHttpClient,
  setSession: (session: AuthSessionModel | null) => void,
  setFamilyId: (id: FamilyId | null) => void,
  queryClient: QueryClient
) {
  const session = await new AuthGetSessionUseCase(httpClient).getSession();
  setSession(session);
  applyActiveFamilyFromSession(session, setFamilyId);
  queryClient.setQueryData(queryKeys.auth.session(), session);
  return session;
}

export function useMyFamilies(enabled = true) {
  const httpClient = HttpClientFactory.create();
  const useCase = new ListFamiliesUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.families.lists(),
    queryFn: () => useCase.listMine(),
    enabled,
  });
}

export function useCreateFamily() {
  const { setSession } = useAuth();
  const { setFamilyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new CreateFamilyUseCase(httpClient);

  return useMutation({
    mutationFn: (data: CreateFamilyRequest) => useCase.create(data),
    onSuccess: async (created) => {
      try {
        await refreshAuthSession(httpClient, setSession, setFamilyId, queryClient);
      } catch (error) {
        console.error(error);
      }
      setFamilyId(created.id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.families.lists() });
    },
  });
}

export function useJoinFamily() {
  const { setSession } = useAuth();
  const { setFamilyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new JoinFamilyUseCase(httpClient);

  return useMutation({
    mutationFn: (data: JoinFamilyRequest) => useCase.join(data),
    onSuccess: async (joined) => {
      try {
        await refreshAuthSession(httpClient, setSession, setFamilyId, queryClient);
      } catch (error) {
        console.error(error);
      }
      setFamilyId(joined.familyId);
      void queryClient.invalidateQueries({ queryKey: queryKeys.families.lists() });
    },
  });
}

export function useCreateInvite() {
  const httpClient = HttpClientFactory.create();
  const useCase = new CreateInviteUseCase(httpClient);

  return useMutation({
    mutationFn: (data: CreateInviteRequest) => useCase.createInvite(data),
  });
}

export function useUpdateFamily() {
  const { familyId } = useFamily();
  const { setSession } = useAuth();
  const { setFamilyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new UpdateFamilyUseCase(httpClient);

  return useMutation({
    mutationFn: (data: UpdateFamilyRequest) => {
      if (!familyId) {
        throw new Error('No active family selected.');
      }

      return useCase.update(familyId, data);
    },
    onSuccess: () => {
      void refreshAuthSession(httpClient, setSession, setFamilyId, queryClient).catch(console.error);
      void queryClient.invalidateQueries({ queryKey: queryKeys.families.lists() });
    },
  });
}

export function useDeleteFamily() {
  const { familyId, setFamilyId } = useFamily();
  const { setSession } = useAuth();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new DeleteFamilyUseCase(httpClient);

  return useMutation({
    mutationFn: (data: DeleteFamilyRequest) => {
      if (!familyId) {
        throw new Error('No active family selected.');
      }

      return useCase.delete(familyId, data);
    },
    onSuccess: async () => {
      const session = await refreshAuthSession(httpClient, setSession, setFamilyId, queryClient);
      setFamilyId(session.families[0]?.id ?? null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.families.lists() });
      return session;
    },
  });
}

export function useFamilyMembers() {
  const { familyId } = useFamily();
  const httpClient = HttpClientFactory.create();
  const useCase = new ListFamilyMembersUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.families.members(familyId),
    queryFn: () => {
      if (!familyId) {
        throw new Error('No active family selected.');
      }

      return useCase.listMembers(familyId);
    },
    enabled: Boolean(familyId),
  });
}

export function useRemoveFamilyMember() {
  const { familyId, setFamilyId } = useFamily();
  const { setSession } = useAuth();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new RemoveFamilyMemberUseCase(httpClient);

  return useMutation({
    mutationFn: async (memberUserId: string) => {
      if (!familyId) {
        throw new Error('No active family selected.');
      }

      await useCase.removeMember(familyId, memberUserId);

      const session = queryClient.getQueryData<AuthSessionModel>(queryKeys.auth.session());
      if (session?.user.id !== memberUserId) {
        return null;
      }

      return refreshAuthSession(httpClient, setSession, setFamilyId, queryClient);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.families.members(familyId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.families.lists() });
    },
  });
}
