const REMINDER_REQUESTS_STORAGE_KEY = 'cosquin-rock-2026-reminders';

export const getReminderRequestedShowIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(REMINDER_REQUESTS_STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
};

export const hasReminderRequested = (showId: string): boolean => {
  return getReminderRequestedShowIds().includes(showId);
};

export const markReminderRequested = (showId: string): void => {
  if (typeof window === 'undefined') return;

  const requestedIds = new Set(getReminderRequestedShowIds());
  requestedIds.add(showId);
  window.localStorage.setItem(REMINDER_REQUESTS_STORAGE_KEY, JSON.stringify([...requestedIds]));
};
