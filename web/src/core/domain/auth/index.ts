// Models
export type AuthUserModel = {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
};

export type FamilyMembershipModel = {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
};

export type AuthSessionModel = {
  user: AuthUserModel;
  families: FamilyMembershipModel[];
  isNewUser: boolean;
  familyCount: number;
};

export type AntiforgeryModel = {
  requestToken: string;
};

// Requests
export type GoogleAuthRequest = {
  idToken: string;
};

// Responses
export type GoogleAuthResponse = AuthSessionModel;
export type AntiforgeryResponse = AntiforgeryModel;
