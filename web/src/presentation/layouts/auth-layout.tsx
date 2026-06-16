'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations('app.shell');

  return (
    <div className="web-auth">
      <div className="web-auth__hero">
        <p className="web-auth__hero-title">{t('brand')}</p>
        <p className="web-auth__hero-subtitle">{t('brandTagline')}</p>
      </div>
      <div className="web-auth__panel">
        <div className="web-auth__card glass-light">{children}</div>
      </div>
    </div>
  );
}
