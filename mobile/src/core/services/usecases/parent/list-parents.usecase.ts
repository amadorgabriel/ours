import type { ParentSummary } from '@/core/domain/parent';
import type { IParent } from '@/core/domain/parent/index.contract';

export class ListParentsUseCase implements Pick<IParent, 'listMine'> {
  async listMine(): Promise<ParentSummary[]> {
    // Stub until GET /parents is exposed (M5 server). Wire HTTP here when ready.
    return [];
  }
}
