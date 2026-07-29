import type { IHttpClient } from '@/core/infra/http/index.types';

export class RemoveFamilyMemberUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async removeMember(familyId: string, memberUserId: string): Promise<void> {
    await this.httpClient.request<void>({
      method: 'delete',
      url: `/families/${familyId}/members/${memberUserId}`,
    });
  }
}
