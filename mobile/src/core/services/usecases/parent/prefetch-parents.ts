import type { QueryClient } from '@tanstack/react-query';

import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';

import { ListParentsUseCase } from './list-parents.usecase';

export async function prefetchParentsForFamily(
  queryClient: QueryClient,
  familyId: string
): Promise<void> {
  const httpClient = HttpClientFactory.create();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.parents.list(familyId),
    queryFn: async () => {
      const response = await new ListParentsUseCase(httpClient).listMine();
      return response.items;
    },
  });
}
