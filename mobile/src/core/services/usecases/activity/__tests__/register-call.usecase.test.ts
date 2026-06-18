import type { RegisterCallResponse } from '@/core/domain/activity';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { RegisterCallUseCase } from '../register-call.usecase';

describe('RegisterCallUseCase', () => {
  it('registers call via POST /activities/call', async () => {
    const created: RegisterCallResponse = {
      id: 'act-1',
      type: 'Call',
      createdAt: '2026-06-18T12:00:00.000Z',
      userId: 'user-1',
      userName: 'Ana',
      parentId: 'parent-1',
      parentName: 'Pai',
      notes: 'Ligação rápida',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: created });
    const httpClient: IHttpClient = { request };

    const useCase = new RegisterCallUseCase(httpClient);
    const result = await useCase.registerCall({
      parentId: 'parent-1',
      notes: 'Ligação rápida',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/activities/call',
      body: {
        parentId: 'parent-1',
        notes: 'Ligação rápida',
      },
    });
    expect(result).toEqual(created);
  });
});
