import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render-with-providers';

import { InviteModal } from './invite-modal';

const mutate = vi.fn((_data: unknown, options?: { onSuccess?: (result: unknown) => void }) => {
  options?.onSuccess?.({
    inviteCode: 'ABC123',
    expiresAt: '2026-06-09T15:00:00.000Z',
  });
});

vi.mock('@/core/services/usecases/family/index.hooks', () => ({
  useCreateInvite: () => ({
    mutate,
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('InviteModal', () => {
  it('WHEN invite is generated THEN SHALL show code, expiry and copy button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InviteModal opened onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Gerar código' }));

    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText(/Válido até/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copiar código' })).toBeInTheDocument();
  });
});
