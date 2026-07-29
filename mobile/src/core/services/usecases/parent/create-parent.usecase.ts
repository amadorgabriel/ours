import type { CreateParentRequest, ParentSummary } from '@/core/domain/parent';
import type { IParent } from '@/core/domain/parent/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class CreateParentUseCase implements Pick<IParent, 'createParent'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async createParent(params: CreateParentRequest): Promise<ParentSummary> {
    const response = await this.httpClient.request<ParentSummary>({
      method: 'post',
      url: '/parents',
      body: params,
    });

    return response.data;
  }
}
