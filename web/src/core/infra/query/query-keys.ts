export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    antiforgery: () => [...queryKeys.auth.all, 'antiforgery'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  families: {
    all: ['families'] as const,
    lists: () => [...queryKeys.families.all, 'list'] as const,
    list: (familyId?: string | null) =>
      [...queryKeys.families.lists(), familyId ?? 'none'] as const,
  },
} as const;
