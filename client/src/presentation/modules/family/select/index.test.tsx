import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render-with-providers';

import { FamilySelectPage } from './index';

const replace = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/core/services/usecases/family/index.hooks', () => ({
  useMyFamilies: () => ({
    data: [
      { id: 'family-1', name: 'Família Silva', role: 'Admin' as const },
      { id: 'family-2', name: 'Família Costa', role: 'Member' as const },
    ],
    isLoading: false,
    isError: false,
  }),
}));

describe('FamilySelectPage', () => {
  it('WHEN families are listed THEN SHALL allow selecting one', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FamilySelectPage />);

    expect(screen.getByText('Família Silva')).toBeInTheDocument();
    expect(screen.getByText('Família Costa')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Selecionar' })[0]!);

    expect(replace).toHaveBeenCalledWith('/dashboard');
  });
});
