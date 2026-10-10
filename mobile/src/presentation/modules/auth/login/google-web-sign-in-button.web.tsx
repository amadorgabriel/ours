import { useEffect, useRef } from 'react';

import { mountGoogleWebSignInButton } from '@/core/infra/auth/google-web-sign-in';

type GoogleWebSignInButtonProps = {
  clientId: string;
  onCredential: (idToken: string) => void;
  onError: (error: unknown) => void;
};

export function GoogleWebSignInButton({
  clientId,
  onCredential,
  onError,
}: GoogleWebSignInButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = hostRef.current;
    if (!container || !clientId) return;

    let cancelled = false;

    void mountGoogleWebSignInButton({
      clientId,
      container,
      onCredential: (idToken) => onCredentialRef.current(idToken),
    }).catch((error: unknown) => {
      if (cancelled) return;
      console.error('[Login]', error);
      onErrorRef.current(error);
    });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return <div ref={hostRef} style={{ minHeight: 44, width: '100%' }} />;
}
