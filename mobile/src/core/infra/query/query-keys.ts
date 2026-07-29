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
    members: (familyId?: string | null) =>
      [...queryKeys.families.all, 'members', familyId ?? 'none'] as const,
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
    feed: (familyId?: string | null, parentId?: string | null) =>
      [...queryKeys.activities.all, 'feed', familyId ?? 'none', parentId ?? 'all'] as const,
    byMonth: (
      familyId: string | null | undefined,
      year: number,
      month: number,
      parentId?: string | null
    ) =>
      [
        ...queryKeys.activities.all,
        'month',
        familyId ?? 'none',
        year,
        month,
        parentId ?? 'all',
      ] as const,
  },
  goals: {
    all: ['goals'] as const,
    list: (familyId?: string | null, parentId?: string | null) =>
      [...queryKeys.goals.all, 'list', familyId ?? 'none', parentId ?? 'all'] as const,
    contributions: (familyId: string | null | undefined, goalId: string) =>
      [...queryKeys.goals.all, 'contributions', familyId ?? 'none', goalId] as const,
  },
} as const;
