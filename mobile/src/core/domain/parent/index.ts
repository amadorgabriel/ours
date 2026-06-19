export type ParentId = string;

export type ParentSummary = {
  id: ParentId;
  name: string;
  relationship: string;
  birthDate?: string;
};

export type ParentListResponse = {
  items: ParentSummary[];
};

export type CreateParentRequest = {
  name: string;
  relationship: string;
  birthDate?: string;
};

export type UpdateParentRequest = CreateParentRequest;

export const PARENT_RELATIONSHIPS = ['Pai', 'Mãe', 'Outro'] as const;

export type ParentRelationship = (typeof PARENT_RELATIONSHIPS)[number];
