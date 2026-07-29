import type { ParentDetail, ParentId, UpdateParentRequest } from '@/core/domain/parent';
import type { IParent } from '@/core/domain/parent/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class UpdateParentUseCase implements Pick<IParent, 'updateParent'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async updateParent(id: ParentId, params: UpdateParentRequest): Promise<ParentDetail> {
    const response = await this.httpClient.request<ParentDetail>({
      method: 'put',
      url: `/parents/${id}`,
      body: params,
    });

    return response.data;
  }
}
