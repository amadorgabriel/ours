import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { CreateInviteUseCase } from './create-invite.usecase';
import { mockInvite } from './index.mock';

describe('CreateInviteUseCase', () => {
  it('WHEN API creates invite THEN SHALL POST /invite with family header', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/invite', 'post', {
      statusCode: 200,
      data: mockInvite,
    });

    const useCase = new CreateInviteUseCase(mock);
    const result = await useCase.createInvite({ invitedEmail: 'irmao@example.com' });

    expect(result).toEqual(mockInvite);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.method).toBe('post');
    expect(mock.requests[0]?.url).toBe('/invite');
    expect(mock.requests[0]?.body).toEqual({ invitedEmail: 'irmao@example.com' });
    expect(mock.requests[0]?.skipFamilyHeader).toBeUndefined();
  });

  it('WHEN API returns 403 THEN SHALL throw HttpClientError', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/invite', 'post', {
      statusCode: 403,
      data: { message: 'Only the family admin can create invites.' },
    });

    const useCase = new CreateInviteUseCase(mock);

    await expect(useCase.createInvite({})).rejects.toMatchObject({ statusCode: 403 });
  });
});
