import type { CreateFamilyRequest, CreateFamilyResponse, FamilyModel } from './index';

export interface IFamily {
  create(params: CreateFamilyRequest): Promise<CreateFamilyResponse>;
  listMine(): Promise<FamilyModel[]>;
}
