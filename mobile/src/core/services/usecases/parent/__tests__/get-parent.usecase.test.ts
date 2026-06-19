import type { ParentDetail } from '@/core/domain/parent';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { GetParentUseCase } from '../get-parent.usecase';

describe('GetParentUseCase', () => {
  it('fetches parent detail via GET /parents/{id}', async () => {
    const detail: ParentDetail = {
      id: 'p1',
      name: 'João',
      relationship: 'Pai',
      medicalInfo: 'Alergia',
      emergencyBriefing: 'Ligar 192',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: detail });
    const httpClient: IHttpClient = { request };

    const useCase = new GetParentUseCase(httpClient);
    const result = await useCase.getParent('p1');

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/parents/p1',
    });
    expect(result).toEqual(detail);
  });
});
