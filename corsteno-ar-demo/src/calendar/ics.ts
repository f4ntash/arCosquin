import { type ResolvedFestivalShow } from '../data/cosquinRock2026';

const CALENDAR_TIMEZONE = 'America/Argentina/Cordoba';
const CALENDAR_PRODUCT_ID = '-//Corsteno//Cosquin Rock 2026//ES';

export const createShowIcs = (show: ResolvedFestivalShow, reminderMinutes: number): string => {
  return createCalendar([createEvent(show, reminderMinutes)]);
};

export const createFavoritesIcs = (shows: ResolvedFestivalShow[], reminderMinutes: number): string => {
  return createCalendar(shows.map((show) => createEvent(show, reminderMinutes)));
};

export const getShowIcsFilename = (show: ResolvedFestivalShow): string => {
  return `recordatorio-${slugify(show.artist)}.ics`;
};

const createCalendar = (events: string[]): string => {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${CALENDAR_PRODUCT_ID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    createTimezone(),
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
};

const createEvent = (show: ResolvedFestivalShow, reminderMinutes: number): string => {
  return [
    'BEGIN:VEVENT',
    `UID:${escapeCalendarValue(`${show.id}@cosquinrock.corsteno.com`)}`,
    `DTSTAMP:${formatUtcDate(new Date())}`,
    `DTSTART;TZID=${CALENDAR_TIMEZONE}:${formatLocalDate(show.startsAt)}`,
    `DTEND;TZID=${CALENDAR_TIMEZONE}:${formatLocalDate(show.endsAt)}`,
    `SUMMARY:${escapeCalendarValue(`Cosquín Rock - ${show.artist}`)}`,
    `LOCATION:${escapeCalendarValue(show.stage.name)}`,
    `DESCRIPTION:${escapeCalendarValue(`${show.artist} · Cosquín Rock 2026 · ${show.stage.name}`)}`,
    'BEGIN:VALARM',
    `TRIGGER:-PT${reminderMinutes}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeCalendarValue(`${show.artist} empieza en ${reminderMinutes} minutos`)}`,
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n');
};

const createTimezone = (): string => {
  return [
    'BEGIN:VTIMEZONE',
    `TZID:${CALENDAR_TIMEZONE}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:-0300',
    'TZOFFSETTO:-0300',
    'TZNAME:-03',
    'END:STANDARD',
    'END:VTIMEZONE',
  ].join('\r\n');
};

const formatLocalDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CALENDAR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return `${value('year')}${value('month')}${value('day')}T${value('hour')}${value('minute')}${value('second')}`;
};

const formatUtcDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const escapeCalendarValue = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
};

const slugify = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
