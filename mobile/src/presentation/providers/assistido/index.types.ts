import type { ParentId, ParentSummary } from '@/core/domain/parent';

export type AssistidoContextValue = {
  parentId: ParentId | null;
  activeParent: ParentSummary | null;
  parents: ParentSummary[];
  isLoading: boolean;
  setParentId: (id: ParentId | null) => void;
};
