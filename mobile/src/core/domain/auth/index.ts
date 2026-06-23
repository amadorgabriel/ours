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
  createdAt?: string;
};

export type AuthSessionModel = {
  user: AuthUserModel;
  families: FamilyMembershipModel[];
  isNewUser: boolean;
  familyCount: number;
  accessToken?: string | null;
};

export type GoogleAuthRequest = {
  idToken: string;
};

export type GoogleAuthResponse = AuthSessionModel;
