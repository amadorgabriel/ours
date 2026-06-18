import Constants from 'expo-constants';

export function getGoogleWebClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;
}

export function getGoogleIosClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(getGoogleWebClientId());
}

export function getGoogleIosUrlScheme(): string | undefined {
  const scheme = Constants.expoConfig?.extra?.googleSignIn?.iosUrlScheme;
  return typeof scheme === 'string' && !scheme.includes('YOUR_IOS') ? scheme : undefined;
}
