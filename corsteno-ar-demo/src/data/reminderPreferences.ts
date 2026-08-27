const REMINDER_OFFSET_STORAGE_KEY = 'cosquin-rock-reminder-offset';
const DEFAULT_REMINDER_OFFSET_MINUTES = 15;
export const REMINDER_OFFSET_OPTIONS = [10, 15, 30] as const;

export type ReminderOffsetMinutes = (typeof REMINDER_OFFSET_OPTIONS)[number];

export const getReminderOffsetMinutes = (): ReminderOffsetMinutes => {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_OFFSET_MINUTES;

  const storedValue = Number(window.localStorage.getItem(REMINDER_OFFSET_STORAGE_KEY));
  return isReminderOffsetMinutes(storedValue) ? storedValue : DEFAULT_REMINDER_OFFSET_MINUTES;
};

export const setReminderOffsetMinutes = (minutes: ReminderOffsetMinutes): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REMINDER_OFFSET_STORAGE_KEY, String(minutes));
};

const isReminderOffsetMinutes = (value: number): value is ReminderOffsetMinutes => {
  return REMINDER_OFFSET_OPTIONS.includes(value as ReminderOffsetMinutes);
};
