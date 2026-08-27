import { formatShowTimeRange, type ResolvedFestivalShow } from '../data/cosquinRock2026';

const GOOGLE_CALENDAR_CREATE_EVENT_URL = 'https://calendar.google.com/calendar/render';

export const createGoogleCalendarUrl = (show: ResolvedFestivalShow): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Cosquín Rock - ${show.artist}`,
    dates: `${formatGoogleDate(show.startsAt)}/${formatGoogleDate(show.endsAt)}`,
    details: [
      `${show.artist} · Cosquín Rock 2026`,
      show.stage.name,
      formatShowTimeRange(show),
      '',
      'Recordatorio en tu calendario.',
    ].join('\n'),
    location: show.stage.name,
  });

  return `${GOOGLE_CALENDAR_CREATE_EVENT_URL}?${params.toString()}`;
};

const formatGoogleDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};
