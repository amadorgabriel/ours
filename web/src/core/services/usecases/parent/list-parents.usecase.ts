import type { ParentListResponse } from '@/core/domain/parent';
import type { IParent } from '@/core/domain/parent/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListParentsUseCase implements Pick<IParent, 'listMine'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listMine(): Promise<ParentListResponse> {
    const response = await this.httpClient.request<ParentListResponse>({
      method: 'get',
      url: '/parents',
    });

    return response.data;
  }
}
