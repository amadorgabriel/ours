import type {
  CreateFamilyResponse,
  CreateInviteResponse,
  FamilyWithRoleModel,
  JoinFamilyResponse,
} from '@/core/domain/family';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';

export const mockCreatedFamily: CreateFamilyResponse = {
  id: 'family-mock-new',
  name: 'Família Silva',
};

export const mockFamiliesList: FamilyWithRoleModel[] = [
  { id: 'family-mock-1', name: 'Família Mock', role: 'Admin' },
  { id: 'family-mock-2', name: 'Família Costa', role: 'Member' },
];

export const mockInvite: CreateInviteResponse = {
  inviteCode: 'ABC123',
  expiresAt: '2026-06-09T12:00:00.000Z',
};

export const mockJoinResponse: JoinFamilyResponse = {
  familyId: 'family-mock-1',
  familyName: 'Família Mock',
  role: 'Member',
};

export function setupFamilyMocks(): void {
  const mock = HttpClientFactory.createMock();

  mock.setMockResponse('/families', 'post', {
    statusCode: 200,
    data: mockCreatedFamily,
  });

  mock.setMockResponse('/families/my', 'get', {
    statusCode: 200,
    data: mockFamiliesList,
  });

  mock.setMockResponse('/invite', 'post', {
    statusCode: 200,
    data: mockInvite,
  });

  mock.setMockResponse('/join', 'post', {
    statusCode: 200,
    data: mockJoinResponse,
  });
}
