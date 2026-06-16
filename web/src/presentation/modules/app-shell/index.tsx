'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';

type AppShellProps = {
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  show: boolean;
};

function formatLogoutError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function navLinkClass(isActive: boolean): string {
  return `web-sidebar__link${isActive ? ' web-sidebar__link--active' : ''}`;
}

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations('app.shell');
  const tLogout = useTranslations('auth.logout');
  const pathname = usePathname();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const logoutMutation = useLogout();

  const activeFamily = useMemo(() => {
    if (!familyId || !session) return null;
    return session.families.find((family) => family.id === familyId) ?? null;
  }, [familyId, session]);

  const hasMultipleFamilies = (session?.familyCount ?? 0) > 1;

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('nav.dashboard'), show: true },
    { href: '/families/select', label: t('nav.families'), show: hasMultipleFamilies },
    { href: '/families/add', label: t('nav.addFamily'), show: true },
  ];

  return (
    <div className="web-shell">
      <aside className="web-sidebar">
        <div className="web-sidebar__brand">{t('brand')}</div>

        <nav className="web-sidebar__nav" aria-label={t('nav.aria')}>
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(pathname === item.href)}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="web-sidebar__footer">
          <Text size="sm" c="white" style={{ opacity: 0.9 }} truncate="end">
            {session?.user.name}
          </Text>
          {activeFamily && (
            <Text size="xs" c="white" style={{ opacity: 0.65 }} truncate="end" mt={4}>
              {activeFamily.name}
            </Text>
          )}
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            mt="sm"
            fullWidth
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            styles={{ root: { color: 'rgba(255,255,255,0.9)' } }}
          >
            {tLogout('cta')}
          </Button>
          {logoutMutation.isError && logoutMutation.error && (
            <Text c="red.3" size="xs" mt={4}>
              {tLogout('error')} {formatLogoutError(logoutMutation.error)}
            </Text>
          )}
        </div>
      </aside>

      <div className="web-shell__main">
        <header className="web-shell__topbar">
          <div className="min-w-0">
            <Text fw={600} size="lg" truncate>
              {activeFamily?.name ?? t('brand')}
            </Text>
            {activeFamily && (
              <Text size="sm" c="dimmed" truncate>
                {session?.user.name}
              </Text>
            )}
          </div>
          <Button
            variant="subtle"
            size="compact-sm"
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            className="lg:hidden"
          >
            {tLogout('cta')}
          </Button>
        </header>

        <main className="web-shell__content">{children}</main>
      </div>
    </div>
  );
}
