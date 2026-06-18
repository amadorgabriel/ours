import type { FamilyWithRoleModel } from '@/core/domain/family';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { ListFamiliesUseCase } from '../list-families.usecase';

describe('ListFamiliesUseCase', () => {
  it('lists user families via GET /families/my', async () => {
    const families: FamilyWithRoleModel[] = [
      { id: 'f1', name: 'Família A', role: 'Admin' },
      { id: 'f2', name: 'Família B', role: 'Member' },
    ];
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: families });
    const httpClient: IHttpClient = { request };

    const useCase = new ListFamiliesUseCase(httpClient);
    const result = await useCase.listMine();

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/families/my',
      skipFamilyHeader: true,
    });
    expect(result).toEqual(families);
  });
});
