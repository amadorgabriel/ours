import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import type { AuthSessionModel } from '@/core/domain/auth';
import type {
  CreateFamilyRequest,
  CreateInviteRequest,
  FamilyId,
  JoinFamilyRequest,
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
import { JoinFamilyUseCase } from './join-family.usecase';
import { ListFamiliesUseCase } from './list-families.usecase';

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
    onSuccess: (created) => {
      void refreshAuthSession(httpClient, setSession, setFamilyId, queryClient).catch(console.error);
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
    onSuccess: (joined) => {
      void refreshAuthSession(httpClient, setSession, setFamilyId, queryClient).catch(console.error);
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
