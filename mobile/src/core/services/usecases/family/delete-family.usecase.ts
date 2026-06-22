import type { DeleteFamilyRequest } from '@/core/domain/family';
import type { IFamily } from '@/core/domain/family/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class DeleteFamilyUseCase implements Pick<IFamily, 'delete'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async delete(familyId: string, params: DeleteFamilyRequest): Promise<void> {
    await this.httpClient.request<void, DeleteFamilyRequest>({
      method: 'delete',
      url: `/families/${familyId}`,
      body: params,
      skipFamilyHeader: true,
    });
  }
}
