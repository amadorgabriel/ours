import type { CreateInviteResponse } from '@/core/domain/family';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { CreateInviteUseCase } from '../create-invite.usecase';

describe('CreateInviteUseCase', () => {
  it('creates invite via POST /invite (M-FAM-04)', async () => {
    const created: CreateInviteResponse = {
      inviteCode: 'AB12CD',
      expiresAt: '2026-06-19T12:00:00.000Z',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: created });
    const httpClient: IHttpClient = { request };

    const useCase = new CreateInviteUseCase(httpClient);
    const result = await useCase.createInvite({});

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/invite',
      body: {},
    });
    expect(result).toEqual(created);
  });
});
