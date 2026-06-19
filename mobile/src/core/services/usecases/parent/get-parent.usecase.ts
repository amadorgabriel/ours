import type { ParentDetail, ParentId } from '@/core/domain/parent';
import type { IParent } from '@/core/domain/parent/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class GetParentUseCase implements Pick<IParent, 'getParent'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async getParent(id: ParentId): Promise<ParentDetail> {
    const response = await this.httpClient.request<ParentDetail>({
      method: 'get',
      url: `/parents/${id}`,
    });

    return response.data;
  }
}
