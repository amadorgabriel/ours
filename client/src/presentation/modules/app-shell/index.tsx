'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import { useAuth } from '@/presentation/providers/auth';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';

type AppShellProps = {
  children: ReactNode;
};

function formatLogoutError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations('auth.logout');
  const { session } = useAuth();
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <Text fw={500}>{session?.user.name}</Text>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="subtle"
            size="sm"
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            {t('cta')}
          </Button>
          {logoutMutation.isError && logoutMutation.error && (
            <Text c="red" size="xs">
              {t('error')} {formatLogoutError(logoutMutation.error)}
            </Text>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col bg-zinc-50">{children}</main>
    </div>
  );
}
