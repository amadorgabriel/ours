const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client?hl=pt-BR';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentityId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number | boolean>
  ) => void;
  disableAutoSelect: () => void;
};

type GoogleIdentity = {
  accounts: {
    id: GoogleIdentityId;
  };
};

type BrowserWindow = Window & { google?: GoogleIdentity };

let scriptPromise: Promise<void> | null = null;

function browserWindow(): BrowserWindow | undefined {
  if (typeof window === 'undefined') return undefined;
  return window as BrowserWindow;
}

function loadGoogleIdentityScript(): Promise<void> {
  const browser = browserWindow();
  if (!browser) {
    return Promise.reject(new Error('Google Sign-In web requires a browser'));
  }

  if (browser.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://accounts.google.com/gsi/client"]'
    );

    const finish = () => {
      if (browser.google?.accounts?.id) {
        resolve();
        return;
      }
      scriptPromise = null;
      reject(new Error('Google Sign-In web failed to initialize'));
    };

    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener(
        'error',
        () => {
          scriptPromise = null;
          reject(new Error('Google Sign-In web failed to load'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.onload = finish;
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Google Sign-In web failed to load'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/** Renders Google's web button. The native module has no web implementation. */
export async function mountGoogleWebSignInButton(options: {
  clientId: string;
  container: HTMLElement;
  onCredential: (idToken: string) => void;
}): Promise<void> {
  await loadGoogleIdentityScript();

  const googleId = browserWindow()?.google?.accounts.id;
  if (!googleId) {
    throw new Error('Google Sign-In web failed to initialize');
  }

  googleId.initialize({
    client_id: options.clientId,
    auto_select: false,
    cancel_on_tap_outside: true,
    callback: (response) => {
      if (response.credential) {
        options.onCredential(response.credential);
      }
    },
  });

  options.container.replaceChildren();
  const measuredWidth = options.container.getBoundingClientRect?.().width ?? 0;
  const width = measuredWidth >= 200 ? Math.min(400, Math.floor(measuredWidth)) : 320;

  googleId.renderButton(options.container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width,
    locale: 'pt-BR',
  });
}

export function disableGoogleWebAutoSelect(): void {
  browserWindow()?.google?.accounts.id.disableAutoSelect();
}
