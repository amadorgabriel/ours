import { GoogleSignin } from '@react-native-google-signin/google-signin';

import {
  clearGoogleSignInSession,
  prepareGoogleSignInForAccountPicker,
} from '../google-signin-session';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    signOut: jest.fn(),
    revokeAccess: jest.fn(),
    hasPreviousSignIn: jest.fn(),
  },
}));

const mockSignOut = GoogleSignin.signOut as jest.MockedFunction<typeof GoogleSignin.signOut>;
const mockRevokeAccess = GoogleSignin.revokeAccess as jest.MockedFunction<
  typeof GoogleSignin.revokeAccess
>;
const mockHasPreviousSignIn = GoogleSignin.hasPreviousSignIn as jest.MockedFunction<
  typeof GoogleSignin.hasPreviousSignIn
>;

describe('clearGoogleSignInSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(null);
    mockRevokeAccess.mockResolvedValue(null);
  });

  it('calls signOut and revokeAccess', async () => {
    await clearGoogleSignInSession();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRevokeAccess).toHaveBeenCalledTimes(1);
  });

  it('still revokes access when signOut fails', async () => {
    mockSignOut.mockRejectedValue(new Error('signOut failed'));

    await clearGoogleSignInSession();

    expect(mockRevokeAccess).toHaveBeenCalledTimes(1);
  });

  it('does not throw when revokeAccess fails', async () => {
    mockRevokeAccess.mockRejectedValue(new Error('revoke failed'));

    await expect(clearGoogleSignInSession()).resolves.toBeUndefined();
  });
});

describe('prepareGoogleSignInForAccountPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(null);
    mockRevokeAccess.mockResolvedValue(null);
  });

  it('clears session when a previous sign-in exists', async () => {
    mockHasPreviousSignIn.mockReturnValue(true);

    await prepareGoogleSignInForAccountPicker();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRevokeAccess).toHaveBeenCalledTimes(1);
  });

  it('skips teardown when there is no previous sign-in', async () => {
    mockHasPreviousSignIn.mockReturnValue(false);

    await prepareGoogleSignInForAccountPicker();

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockRevokeAccess).not.toHaveBeenCalled();
  });
});
