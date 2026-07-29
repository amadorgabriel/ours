import type { FamilyMemberListResponse } from '@/core/domain/family';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListFamilyMembersUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async listMembers(familyId: string): Promise<FamilyMemberListResponse> {
    const response = await this.httpClient.request<FamilyMemberListResponse>({
      method: 'get',
      url: `/families/${familyId}/members`,
    });

    return response.data;
  }
}
