import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render-with-providers';

import { FamilyAddPage } from './index';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/core/services/usecases/family/index.hooks', () => ({
  useCreateFamily: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useJoinFamily: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('FamilyAddPage', () => {
  it('WHEN rendered THEN SHALL show additional family setup flow', () => {
    renderWithProviders(<FamilyAddPage />);

    expect(screen.getByText('Adicionar família')).toBeInTheDocument();
    expect(screen.getByText('Criar nova família')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });
});
