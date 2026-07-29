'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import type { ReactNode } from 'react';

import {
  googleOAuthClientId,
  isGoogleOAuthConfigured,
} from '@/core/infra/auth/google-oauth-config';

type GoogleOAuthProviderRootProps = {
  children: ReactNode;
};

export function GoogleOAuthProviderRoot({ children }: GoogleOAuthProviderRootProps) {
  if (!isGoogleOAuthConfigured()) {
    return children;
  }

  return <GoogleOAuthProvider clientId={googleOAuthClientId!}>{children}</GoogleOAuthProvider>;
}
