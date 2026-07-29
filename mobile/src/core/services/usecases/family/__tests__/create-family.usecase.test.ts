import type { CreateFamilyResponse } from '@/core/domain/family';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { CreateFamilyUseCase } from '../create-family.usecase';

describe('CreateFamilyUseCase', () => {
  it('creates family via POST /families (M-FAM-01)', async () => {
    const created: CreateFamilyResponse = { id: 'f1', name: 'Família Silva' };
    const request = jest.fn().mockResolvedValue({ statusCode: 201, data: created });
    const httpClient: IHttpClient = { request };

    const useCase = new CreateFamilyUseCase(httpClient);
    const result = await useCase.create({ name: 'Família Silva' });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/families',
      body: { name: 'Família Silva' },
      skipFamilyHeader: true,
    });
    expect(result).toEqual(created);
  });
});
