import { QueryClient } from '@tanstack/react-query';

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient();
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
