type GoogleMock = {
  initialize: jest.Mock;
  renderButton: jest.Mock;
  disableAutoSelect: jest.Mock;
};

type ScriptElement = {
  src: string;
  async: boolean;
  onload: (() => void) | null;
  onerror: (() => void) | null;
};

function installGoogleMock(): GoogleMock {
  const googleId: GoogleMock = {
    initialize: jest.fn(),
    renderButton: jest.fn(),
    disableAutoSelect: jest.fn(),
  };

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { google: { accounts: { id: googleId } } },
  });

  return googleId;
}

function installDocumentMock() {
  const scripts: ScriptElement[] = [];

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      head: {
        appendChild: (script: ScriptElement) => {
          scripts.push(script);
        },
      },
      querySelector: () => scripts[0] ?? null,
      createElement: () =>
        ({
          src: '',
          async: false,
          onload: null,
          onerror: null,
        }) satisfies ScriptElement,
    },
  });

  return scripts;
}

describe('mountGoogleWebSignInButton', () => {
  let mountGoogleWebSignInButton: typeof import('../google-web-sign-in').mountGoogleWebSignInButton;

  beforeEach(() => {
    jest.resetModules();
    mountGoogleWebSignInButton = require('../google-web-sign-in').mountGoogleWebSignInButton;
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'document');
  });

  it('initializes Google Identity Services and renders the button', async () => {
    const googleId = installGoogleMock();
    const container = { replaceChildren: jest.fn() } as unknown as HTMLElement;
    const onCredential = jest.fn();

    await mountGoogleWebSignInButton({
      clientId: 'web-client-id',
      container,
      onCredential,
    });

    expect(googleId.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'web-client-id',
        auto_select: false,
      })
    );
    expect(container.replaceChildren).toHaveBeenCalledTimes(1);
    expect(googleId.renderButton).toHaveBeenCalledWith(
      container,
      expect.objectContaining({ text: 'signin_with', width: 320 })
    );

    const callback = googleId.initialize.mock.calls[0][0].callback as (response: {
      credential?: string;
    }) => void;
    callback({ credential: 'google-id-token' });
    callback({});

    expect(onCredential).toHaveBeenCalledTimes(1);
    expect(onCredential).toHaveBeenCalledWith('google-id-token');
  });

  it('loads the identity script when Google is not on the page yet', async () => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    const scripts = installDocumentMock();
    const container = { replaceChildren: jest.fn() } as unknown as HTMLElement;

    const pending = mountGoogleWebSignInButton({
      clientId: 'web-client-id',
      container,
      onCredential: jest.fn(),
    });

    expect(scripts[0]?.src).toContain('https://accounts.google.com/gsi/client');

    const googleId = {
      initialize: jest.fn(),
      renderButton: jest.fn(),
      disableAutoSelect: jest.fn(),
    };
    (globalThis as { window: { google?: unknown } }).window.google = {
      accounts: { id: googleId },
    };
    scripts[0]?.onload?.();

    await pending;

    expect(googleId.renderButton).toHaveBeenCalled();
  });
});
