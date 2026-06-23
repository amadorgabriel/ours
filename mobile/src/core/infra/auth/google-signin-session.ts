import { GoogleSignin } from '@react-native-google-signin/google-signin';

/** Best-effort Google Sign-In teardown so the next sign-in can show the account picker. */
export async function clearGoogleSignInSession(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // User may not have signed in with Google on this device.
  }

  try {
    await GoogleSignin.revokeAccess();
  } catch {
    // revokeAccess may fail when there is no active grant; local logout should still proceed.
  }
}

/** Clears a cached Google session before interactive sign-in when a previous account is still remembered. */
export async function prepareGoogleSignInForAccountPicker(): Promise<void> {
  if (!GoogleSignin.hasPreviousSignIn()) {
    return;
  }

  await clearGoogleSignInSession();
}
