'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import { useAuth } from '@/presentation/providers/auth';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';

type MinimalShellProps = {
  children: ReactNode;
};

function formatLogoutError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function MinimalShell({ children }: MinimalShellProps) {
  const t = useTranslations('app.shell');
  const tLogout = useTranslations('auth.logout');
  const { session } = useAuth();
  const logoutMutation = useLogout();

  return (
    <div className="web-minimal-shell">
      <header className="web-minimal-shell__header">
        <Text fw={700} size="lg">
          {t('brand')}
        </Text>
        <div className="web-minimal-shell__header-actions">
          {session?.user.name && (
            <Text size="sm" c="dimmed" className="web-minimal-shell__user" truncate>
              {session.user.name}
            </Text>
          )}
          <Button
            variant="subtle"
            size="compact-sm"
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            {tLogout('cta')}
          </Button>
        </div>
      </header>
      {logoutMutation.isError && logoutMutation.error && (
        <Text c="red" size="xs" px="md" py={4}>
          {tLogout('error')} {formatLogoutError(logoutMutation.error)}
        </Text>
      )}
      <main className="web-minimal-shell__content">{children}</main>
    </div>
  );
}
