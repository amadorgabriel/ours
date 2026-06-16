import { describe, expect, it, beforeEach } from 'vitest';

import {
  getActiveFamilyId,
  registerFamilyIdGetter,
  unregisterFamilyIdGetter,
} from './family-context';

describe('family-context', () => {
  beforeEach(() => {
    unregisterFamilyIdGetter();
  });

  it('WHEN getter is not registered THEN SHALL return null', () => {
    expect(getActiveFamilyId()).toBeNull();
  });

  it('WHEN getter is registered THEN SHALL return active family id', () => {
    registerFamilyIdGetter(() => 'family-abc');
    expect(getActiveFamilyId()).toBe('family-abc');
  });
});
