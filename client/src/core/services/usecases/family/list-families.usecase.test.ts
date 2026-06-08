import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { ListFamiliesUseCase } from './list-families.usecase';
import { mockFamiliesList } from './index.mock';

describe('ListFamiliesUseCase', () => {
  it('WHEN API returns families THEN SHALL GET /families/my', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/families/my', 'get', {
      statusCode: 200,
      data: mockFamiliesList,
    });

    const useCase = new ListFamiliesUseCase(mock);
    const result = await useCase.listMine();

    expect(result).toEqual(mockFamiliesList);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.method).toBe('get');
    expect(mock.requests[0]?.url).toBe('/families/my');
    expect(mock.requests[0]?.skipAntiforgery).toBe(true);
    expect(mock.requests[0]?.skipFamilyHeader).toBe(true);
  });
});
