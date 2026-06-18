import type { FamilyWithRoleModel } from '@/core/domain/family';
import type { IFamily } from '@/core/domain/family/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListFamiliesUseCase implements Pick<IFamily, 'listMine'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listMine(): Promise<FamilyWithRoleModel[]> {
    const response = await this.httpClient.request<FamilyWithRoleModel[]>({
      method: 'get',
      url: '/families/my',
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
