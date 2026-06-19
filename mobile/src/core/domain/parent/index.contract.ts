import type {
  CreateParentRequest,
  ParentDetail,
  ParentListResponse,
  ParentSummary,
  UpdateParentRequest,
} from './index';
import type { ParentId } from './index';

export interface IParent {
  listMine(): Promise<ParentListResponse>;
  getParent(id: ParentId): Promise<ParentDetail>;
  createParent(params: CreateParentRequest): Promise<ParentSummary>;
  updateParent(id: ParentId, params: UpdateParentRequest): Promise<ParentDetail>;
}
