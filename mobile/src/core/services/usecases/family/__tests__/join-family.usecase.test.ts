import type { JoinFamilyResponse } from '@/core/domain/family';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { JoinFamilyUseCase } from '../join-family.usecase';

describe('JoinFamilyUseCase', () => {
  it('joins family via POST /join with normalized invite code (M-FAM-02)', async () => {
    const joined: JoinFamilyResponse = {
      familyId: 'f2',
      familyName: 'Família Costa',
      role: 'Member',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: joined });
    const httpClient: IHttpClient = { request };

    const useCase = new JoinFamilyUseCase(httpClient);
    const result = await useCase.join({ inviteCode: '  ab12cd  ' });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/join',
      body: { inviteCode: 'AB12CD' },
      skipFamilyHeader: true,
    });
    expect(result).toEqual(joined);
  });
});
