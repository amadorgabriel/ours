// Models
export type FamilyId = string;

export type FamilyModel = {
  id: FamilyId;
  name: string;
};

// Requests
export type CreateFamilyRequest = {
  name: string;
};

// Responses
export type CreateFamilyResponse = FamilyModel;
