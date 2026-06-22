import type { UpdateFamilyRequest, UpdateFamilyResponse } from '@/core/domain/family';
import type { IFamily } from '@/core/domain/family/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class UpdateFamilyUseCase implements Pick<IFamily, 'update'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async update(familyId: string, params: UpdateFamilyRequest): Promise<UpdateFamilyResponse> {
    const response = await this.httpClient.request<UpdateFamilyResponse, UpdateFamilyRequest>({
      method: 'patch',
      url: `/families/${familyId}`,
      body: params,
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
