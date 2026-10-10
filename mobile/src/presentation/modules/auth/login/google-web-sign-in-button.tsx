type GoogleWebSignInButtonProps = {
  clientId: string;
  onCredential: (idToken: string) => void;
  onError: (error: unknown) => void;
};

/** Native builds use the Google Sign-In SDK from the login screen. */
export function GoogleWebSignInButton(_props: GoogleWebSignInButtonProps) {
  return null;
}
