import type { GoogleAuthResponse } from '@/core/domain/auth';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';

const mockSession: GoogleAuthResponse = {
  user: {
    id: 'user-mock-1',
    email: 'irmao@example.com',
    name: 'Ana Mock',
    picture: null,
  },
  families: [{ id: 'family-mock-1', name: 'Família Mock', role: 'Admin' }],
  isNewUser: false,
  familyCount: 1,
};

export function setupAuthMocks(): void {
  const mock = HttpClientFactory.createMock();

  mock.setMockResponse('/auth/antiforgery', 'get', {
    statusCode: 200,
    data: { requestToken: 'mock-antiforgery-token' },
  });

  mock.setMockResponse('/auth/google', 'post', {
    statusCode: 200,
    data: mockSession,
  });
}

export { mockSession };
