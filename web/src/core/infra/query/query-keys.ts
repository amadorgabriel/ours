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
  parents: {
    all: ['parents'] as const,
    lists: () => [...queryKeys.parents.all, 'list'] as const,
    list: (familyId?: string | null) =>
      [...queryKeys.parents.lists(), familyId ?? 'none'] as const,
    details: () => [...queryKeys.parents.all, 'detail'] as const,
    detail: (familyId: string | null | undefined, parentId: string) =>
      [...queryKeys.parents.details(), familyId ?? 'none', parentId] as const,
  },
  activities: {
    all: ['activities'] as const,
    feed: (familyId?: string | null) =>
      [...queryKeys.activities.all, 'feed', familyId ?? 'none'] as const,
    byMonth: (familyId: string | null | undefined, year: number, month: number) =>
      [...queryKeys.activities.all, 'month', familyId ?? 'none', year, month] as const,
  },
  goals: {
    all: ['goals'] as const,
    list: (familyId?: string | null) =>
      [...queryKeys.goals.all, 'list', familyId ?? 'none'] as const,
    contributions: (familyId: string | null | undefined, goalId: string) =>
      [...queryKeys.goals.all, 'contributions', familyId ?? 'none', goalId] as const,
  },
} as const;
