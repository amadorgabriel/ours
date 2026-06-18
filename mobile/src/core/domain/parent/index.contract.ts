import type { ParentSummary } from './index';

export interface IParent {
  listMine(): Promise<ParentSummary[]>;
}
