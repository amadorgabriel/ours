import type { ParentListResponse } from '@/core/domain/parent';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { ListParentsUseCase } from '../list-parents.usecase';

describe('ListParentsUseCase', () => {
  it('loads parents via GET /parents', async () => {
    const parents: ParentListResponse = {
      items: [{ id: 'p1', name: 'João', relationship: 'Pai' }],
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: parents });
    const httpClient: IHttpClient = { request };

    const useCase = new ListParentsUseCase(httpClient);
    const result = await useCase.listMine();

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/parents',
    });
    expect(result).toEqual(parents);
  });
});
