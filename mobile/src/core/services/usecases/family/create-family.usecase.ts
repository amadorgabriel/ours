import type { CreateFamilyRequest, CreateFamilyResponse } from '@/core/domain/family';
import type { IFamily } from '@/core/domain/family/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class CreateFamilyUseCase implements Pick<IFamily, 'create'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(params: CreateFamilyRequest): Promise<CreateFamilyResponse> {
    const response = await this.httpClient.request<CreateFamilyResponse, CreateFamilyRequest>({
      method: 'post',
      url: '/families',
      body: params,
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
