import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { JoinFamilyUseCase } from './join-family.usecase';
import { mockJoinResponse } from './index.mock';

describe('JoinFamilyUseCase', () => {
  it('WHEN API accepts join THEN SHALL POST /join with uppercase code', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/join', 'post', {
      statusCode: 200,
      data: mockJoinResponse,
    });

    const useCase = new JoinFamilyUseCase(mock);
    const result = await useCase.join({ inviteCode: ' abc123 ' });

    expect(result).toEqual(mockJoinResponse);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.method).toBe('post');
    expect(mock.requests[0]?.url).toBe('/join');
    expect(mock.requests[0]?.body).toEqual({ inviteCode: 'ABC123' });
    expect(mock.requests[0]?.skipFamilyHeader).toBe(true);
  });

  it('WHEN API returns 409 THEN SHALL throw HttpClientError', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/join', 'post', {
      statusCode: 409,
      data: { message: 'You are already a member of this family.' },
    });

    const useCase = new JoinFamilyUseCase(mock);

    await expect(useCase.join({ inviteCode: 'ABC123' })).rejects.toMatchObject({ statusCode: 409 });
  });
});
