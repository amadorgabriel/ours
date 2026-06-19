import type {
  CreateParentRequest,
  ParentListResponse,
  ParentSummary,
  UpdateParentRequest,
} from './index';
import type { ParentId } from './index';

export interface IParent {
  listMine(): Promise<ParentListResponse>;
  createParent(params: CreateParentRequest): Promise<ParentSummary>;
  updateParent(id: ParentId, params: UpdateParentRequest): Promise<ParentSummary>;
}
