import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/core/infra/query/query-keys';

export function invalidateFamilyDependentQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.parents.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
}
