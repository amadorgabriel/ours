// Models
export type FamilyId = string;

export type FamilyModel = {
  id: FamilyId;
  name: string;
};

export type FamilyWithRoleModel = FamilyModel & {
  role: 'Admin' | 'Member';
};

// Requests
export type CreateFamilyRequest = {
  name: string;
};

export type CreateInviteRequest = {
  invitedEmail?: string;
};

export type JoinFamilyRequest = {
  inviteCode: string;
};

// Responses
export type CreateFamilyResponse = FamilyModel;

export type CreateInviteResponse = {
  inviteCode: string;
  expiresAt: string;
};

export type JoinFamilyResponse = {
  familyId: string;
  familyName: string;
  role: 'Member';
};

export type UpdateFamilyRequest = {
  name: string;
};

export type DeleteFamilyRequest = {
  confirmName: string;
};

export type UpdateFamilyResponse = FamilyModel;

export type FamilyMember = {
  userId: string;
  name: string;
  email?: string;
  role: 'Admin' | 'Member';
  joinedAt: string;
};

export type FamilyMemberListResponse = {
  items: FamilyMember[];
};
