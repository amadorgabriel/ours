import { applyActiveFamilyFromSession } from '../apply-active-family';

describe('applyActiveFamilyFromSession', () => {
  it('sets family id when user has exactly one family', () => {
    const setFamilyId = jest.fn();

    applyActiveFamilyFromSession(
      {
        user: { id: '1', email: 'a@b.com', name: 'A' },
        families: [{ id: 'fam-1', name: 'Família', role: 'Admin' }],
        isNewUser: false,
        familyCount: 1,
      },
      setFamilyId
    );

    expect(setFamilyId).toHaveBeenCalledWith('fam-1');
  });

  it('clears family id when user has multiple families', () => {
    const setFamilyId = jest.fn();

    applyActiveFamilyFromSession(
      {
        user: { id: '1', email: 'a@b.com', name: 'A' },
        families: [],
        isNewUser: false,
        familyCount: 2,
      },
      setFamilyId
    );

    expect(setFamilyId).toHaveBeenCalledWith(null);
  });
});
