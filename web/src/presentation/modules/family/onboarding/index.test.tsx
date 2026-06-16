import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render-with-providers';

import { OnboardingPage } from './index';

vi.mock('@/i18n/navigation', () => ({
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

describe('OnboardingPage', () => {
  it('WHEN rendered THEN SHALL show create and join sections', () => {
    renderWithProviders(<OnboardingPage />);

    expect(screen.getByText('Comece pela sua família')).toBeInTheDocument();
    expect(screen.getAllByText('Criar família').length).toBeGreaterThan(0);
    expect(screen.getByText('Tenho um código')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar na família' })).toBeInTheDocument();
  });
});
