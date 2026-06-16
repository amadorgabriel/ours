import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { getActiveFamilyId } from '@/core/infra/http/family-context';

import { FamilyProvider, useFamily } from './index';

function wrapper({ children }: { children: ReactNode }) {
  return <FamilyProvider>{children}</FamilyProvider>;
}

describe('FamilyProvider', () => {
  it('WHEN family id changes THEN SHALL expose value in context and http getter', () => {
    const { result } = renderHook(() => useFamily(), { wrapper });

    expect(result.current.familyId).toBeNull();
    expect(getActiveFamilyId()).toBeNull();

    act(() => {
      result.current.setFamilyId('family-123');
    });

    expect(result.current.familyId).toBe('family-123');
    expect(getActiveFamilyId()).toBe('family-123');
  });
});
