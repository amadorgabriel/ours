const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isWithinActivityEditWindow(createdAt: string, now = Date.now()): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {
    return false;
  }

  return now - created <= EDIT_WINDOW_MS;
}

export function canEditActivity(
  activityUserId: string,
  currentUserId: string | undefined,
  createdAt: string
): boolean {
  if (!currentUserId || activityUserId !== currentUserId) {
    return false;
  }

  return isWithinActivityEditWindow(createdAt);
}
