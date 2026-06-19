import type { ParentDetail } from '@/core/domain/parent';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { UpdateParentUseCase } from '../update-parent.usecase';

describe('UpdateParentUseCase', () => {
  it('updates parent via PUT /parents/{id}', async () => {
    const updated: ParentDetail = {
      id: 'p1',
      name: 'João Silva',
      relationship: 'Pai',
      medicalInfo: 'Alergia',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: updated });
    const httpClient: IHttpClient = { request };

    const useCase = new UpdateParentUseCase(httpClient);
    const result = await useCase.updateParent('p1', {
      name: 'João Silva',
      relationship: 'Pai',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'put',
      url: '/parents/p1',
      body: { name: 'João Silva', relationship: 'Pai' },
    });
    expect(result).toEqual(updated);
  });
});
