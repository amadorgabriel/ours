import type { IHttpClient } from '@/core/infra/http/index.types';

import { DeleteActivityUseCase } from '../delete-activity.usecase';
import { UpdateActivityUseCase } from '../update-activity.usecase';

describe('UpdateActivityUseCase', () => {
  it('sends PATCH /activities/:id', async () => {
    const request = jest.fn().mockResolvedValue({
      data: { id: 'activity-1', type: 'Call', createdAt: '2026-06-23T00:00:00.000Z' },
    });
    const httpClient = { request } as unknown as IHttpClient;
    const useCase = new UpdateActivityUseCase(httpClient);

    await useCase.updateActivity('activity-1', { notes: 'updated' });

    expect(request).toHaveBeenCalledWith({
      method: 'patch',
      url: '/activities/activity-1',
      body: { notes: 'updated' },
    });
  });
});

describe('DeleteActivityUseCase', () => {
  it('sends DELETE /activities/:id', async () => {
    const request = jest.fn().mockResolvedValue({ data: undefined });
    const httpClient = { request } as unknown as IHttpClient;
    const useCase = new DeleteActivityUseCase(httpClient);

    await useCase.deleteActivity('activity-1');

    expect(request).toHaveBeenCalledWith({
      method: 'delete',
      url: '/activities/activity-1',
    });
  });
});
