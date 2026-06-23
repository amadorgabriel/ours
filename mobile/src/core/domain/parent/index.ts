export type ParentId = string;

export type ParentSummary = {
  id: ParentId;
  name: string;
  relationship: string;
  birthDate?: string;
  photoData?: string;
};

export type ParentDetail = ParentSummary & {
  medicalInfo?: string;
  emergencyBriefing?: string;
};

export type ParentListResponse = {
  items: ParentSummary[];
};

export type CreateParentRequest = {
  name: string;
  relationship: string;
  birthDate?: string;
};

export type UpdateParentRequest = CreateParentRequest & {
  medicalInfo?: string;
  emergencyBriefing?: string;
};

export type UpdateParentPhotoRequest = {
  photoBase64?: string | null;
  mimeType?: string;
};

export const PARENT_RELATIONSHIPS = ['Pai', 'Mãe', 'Outro'] as const;

export type ParentRelationship = (typeof PARENT_RELATIONSHIPS)[number];
