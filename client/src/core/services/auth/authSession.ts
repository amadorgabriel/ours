import 'server-only';

import { cookies } from 'next/headers';

const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:5280';

export async function hasActiveSession(): Promise<boolean> {
  const cookieHeader = (await cookies()).toString();

  if (!cookieHeader) {
    return false;
  }

  try {
    const res = await fetch(`${backendUrl}/api/auth/session`, {
      cache: 'no-store',
      headers: {
        Cookie: cookieHeader,
      },
    });

    return res.ok;
  } catch {
    return false;
  }
}
