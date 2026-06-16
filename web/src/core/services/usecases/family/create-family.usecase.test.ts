import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { CreateFamilyUseCase } from './create-family.usecase';
import { mockCreatedFamily } from './index.mock';

describe('CreateFamilyUseCase', () => {
  it('WHEN API creates family THEN SHALL POST /families with name', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/families', 'post', {
      statusCode: 200,
      data: mockCreatedFamily,
    });

    const useCase = new CreateFamilyUseCase(mock);
    const result = await useCase.create({ name: 'Família Silva' });

    expect(result).toEqual(mockCreatedFamily);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.method).toBe('post');
    expect(mock.requests[0]?.url).toBe('/families');
    expect(mock.requests[0]?.body).toEqual({ name: 'Família Silva' });
    expect(mock.requests[0]?.skipFamilyHeader).toBe(true);
  });

  it('WHEN API returns 400 THEN SHALL throw HttpClientError', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/families', 'post', {
      statusCode: 400,
      data: { message: 'Family name must be between 1 and 100 characters.' },
    });

    const useCase = new CreateFamilyUseCase(mock);

    await expect(useCase.create({ name: '' })).rejects.toMatchObject({ statusCode: 400 });
  });
});
