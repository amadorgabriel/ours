import type {
  CreateFamilyRequest,
  CreateFamilyResponse,
  CreateInviteRequest,
  CreateInviteResponse,
  FamilyWithRoleModel,
  JoinFamilyRequest,
  JoinFamilyResponse,
  DeleteFamilyRequest,
  UpdateFamilyRequest,
  UpdateFamilyResponse,
} from './index';

export interface IFamily {
  create(params: CreateFamilyRequest): Promise<CreateFamilyResponse>;
  listMine(): Promise<FamilyWithRoleModel[]>;
  createInvite(params: CreateInviteRequest): Promise<CreateInviteResponse>;
  join(params: JoinFamilyRequest): Promise<JoinFamilyResponse>;
  update(familyId: string, params: UpdateFamilyRequest): Promise<UpdateFamilyResponse>;
  delete(familyId: string, params: DeleteFamilyRequest): Promise<void>;
}
