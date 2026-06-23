import type { UpdateParentPhotoRequest } from '@/core/domain/parent';
import type { ParentDetail } from '@/core/domain/parent';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class UpdateParentPhotoUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async updatePhoto(parentId: string, data: UpdateParentPhotoRequest): Promise<ParentDetail> {
    const response = await this.httpClient.request<ParentDetail, UpdateParentPhotoRequest>({
      method: 'patch',
      url: `/parents/${parentId}/photo`,
      body: data,
    });

    return response.data;
  }
}
