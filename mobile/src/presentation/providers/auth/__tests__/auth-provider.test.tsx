import renderer, { act } from 'react-test-renderer';

import type { AuthContextValue } from '../index.types';
import { AuthProvider, useAuth } from '../index';

describe('AuthProvider', () => {
  it('throws when useAuth is used outside provider', () => {
    function Outside() {
      useAuth();
      return null;
    }

    expect(() => {
      act(() => {
        renderer.create(<Outside />);
      });
    }).toThrow('useAuth must be used within AuthProvider');
  });

  it('exposes session state and mutators', () => {
    let auth!: AuthContextValue;

    function Capture() {
      auth = useAuth();
      return null;
    }

    act(() => {
      renderer.create(
        <AuthProvider>
          <Capture />
        </AuthProvider>
      );
    });

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.isSessionLoading).toBe(true);
    expect(auth.session).toBeNull();

    act(() => {
      auth.setSession({
        user: { id: '1', email: 'a@b.com', name: 'Ana' },
        families: [{ id: 'f1', name: 'Família', role: 'Admin' }],
        isNewUser: false,
        familyCount: 1,
        accessToken: 'jwt',
      });
      auth.setIsSessionLoading(false);
    });

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.isSessionLoading).toBe(false);
    expect(auth.session?.user.name).toBe('Ana');

    act(() => {
      auth.clearSession();
    });

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.session).toBeNull();
  });
});
