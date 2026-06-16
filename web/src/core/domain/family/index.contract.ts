import type {
  CreateFamilyRequest,
  CreateFamilyResponse,
  CreateInviteRequest,
  CreateInviteResponse,
  FamilyWithRoleModel,
  JoinFamilyRequest,
  JoinFamilyResponse,
} from './index';

export interface IFamily {
  create(params: CreateFamilyRequest): Promise<CreateFamilyResponse>;
  listMine(): Promise<FamilyWithRoleModel[]>;
  createInvite(params: CreateInviteRequest): Promise<CreateInviteResponse>;
  join(params: JoinFamilyRequest): Promise<JoinFamilyResponse>;
}
