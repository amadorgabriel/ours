export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  families: {
    all: ['families'] as const,
    lists: () => [...queryKeys.families.all, 'list'] as const,
    list: (familyId?: string | null) =>
      [...queryKeys.families.lists(), familyId ?? 'none'] as const,
  },
  parents: {
    all: ['parents'] as const,
    lists: () => [...queryKeys.parents.all, 'list'] as const,
    list: (familyId?: string | null) =>
      [...queryKeys.parents.lists(), familyId ?? 'none'] as const,
  },
} as const;
