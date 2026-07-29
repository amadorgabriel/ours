import type { ParentSummary } from '@/core/domain/parent';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { CreateParentUseCase } from '../create-parent.usecase';

describe('CreateParentUseCase', () => {
  it('creates parent via POST /parents', async () => {
    const created: ParentSummary = { id: 'p1', name: 'Maria', relationship: 'Mãe' };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: created });
    const httpClient: IHttpClient = { request };

    const useCase = new CreateParentUseCase(httpClient);
    const result = await useCase.createParent({ name: 'Maria', relationship: 'Mãe' });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/parents',
      body: { name: 'Maria', relationship: 'Mãe' },
    });
    expect(result).toEqual(created);
  });
});
