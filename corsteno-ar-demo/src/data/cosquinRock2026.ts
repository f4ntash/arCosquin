export type FestivalDay = '2026-02-14' | '2026-02-15';

export type StageId =
  | 'norte'
  | 'sur'
  | 'montana'
  | 'boomerang'
  | 'paraguay'
  | 'casita-blues'
  | 'plaza-electronic'
  | 'sorpresa';

export type FestivalStage = {
  id: StageId;
  name: string;
  shortName: string;
};

export type FestivalShow = {
  artist: string;
  stageId: StageId;
  day: FestivalDay;
  startTime: string;
};

export type ResolvedFestivalShow = FestivalShow & {
  id: string;
  stage: FestivalStage;
  startsAt: Date;
  endsAt: Date;
};

export type CurrentShowAcrossStage = {
  stageId: StageId;
  stageName: string;
  stageShortName: string;
  show: ResolvedFestivalShow;
};

export type ShowStatus = 'live' | 'upcoming' | 'finished';
export type ShowTemporalState = 'live' | 'upcoming-today' | 'future-day' | 'finished';

export const DEMO_TIME_ENABLED = true;
export const DEMO_DATE = new Date('2026-02-14T18:00:00-03:00');
export const DEFAULT_LAST_SHOW_DURATION_MINUTES = 75;

export const festivalDays: Array<{ id: FestivalDay; label: string; fullLabel: string }> = [
  { id: '2026-02-14', label: 'SÁB 14', fullLabel: 'SÁBADO 14 DE FEBRERO' },
  { id: '2026-02-15', label: 'DOM 15', fullLabel: 'DOMINGO 15 DE FEBRERO' },
];

export const festivalStages: FestivalStage[] = [
  { id: 'norte', name: 'Escenario Norte', shortName: 'NORTE' },
  { id: 'sur', name: 'Escenario Sur', shortName: 'SUR' },
  { id: 'montana', name: 'Escenario Montaña', shortName: 'MONTAÑA' },
  { id: 'boomerang', name: 'Escenario Boomerang', shortName: 'BOOMERANG' },
  { id: 'paraguay', name: 'Escenario Paraguay', shortName: 'PARAGUAY' },
  { id: 'casita-blues', name: 'La Casita del Blues', shortName: 'BLUES' },
  { id: 'plaza-electronic', name: 'La Plaza Electronic Stage', shortName: 'ELECTRONIC' },
  { id: 'sorpresa', name: 'Escenario Sorpresa', shortName: 'SORPRESA' },
];

export const festivalShows: FestivalShow[] = [
  { day: '2026-02-14', stageId: 'norte', startTime: '14:30', artist: 'Kill Flora' },
  { day: '2026-02-14', stageId: 'norte', startTime: '15:20', artist: 'Eruca Sativa' },
  { day: '2026-02-14', stageId: 'norte', startTime: '16:30', artist: 'El Zar' },
  { day: '2026-02-14', stageId: 'norte', startTime: '17:50', artist: 'Turf' },
  { day: '2026-02-14', stageId: 'norte', startTime: '19:30', artist: 'Dillom' },
  { day: '2026-02-14', stageId: 'norte', startTime: '21:20', artist: 'Babasónicos' },
  { day: '2026-02-14', stageId: 'norte', startTime: '23:20', artist: 'Lali' },
  { day: '2026-02-14', stageId: 'norte', startTime: '00:40', artist: 'Caligaris' },
  { day: '2026-02-14', stageId: 'sur', startTime: '14:30', artist: 'Fantasmagoría' },
  { day: '2026-02-14', stageId: 'sur', startTime: '15:20', artist: 'La Mississippi' },
  { day: '2026-02-14', stageId: 'sur', startTime: '16:30', artist: 'Emi' },
  { day: '2026-02-14', stageId: 'sur', startTime: '17:50', artist: 'Cruzando el Charco' },
  { day: '2026-02-14', stageId: 'sur', startTime: '19:40', artist: 'Ciro y Los Persas' },
  { day: '2026-02-14', stageId: 'sur', startTime: '21:40', artist: 'La Vela Puerca' },
  { day: '2026-02-14', stageId: 'sur', startTime: '23:20', artist: 'Las Pelotas' },
  {
    day: '2026-02-14',
    stageId: 'sur',
    startTime: '00:40',
    artist: 'Viejas Locas / Jóvenes Pordioseros x Fachi y Abel',
  },
  { day: '2026-02-14', stageId: 'montana', startTime: '14:15', artist: 'Chechi de Marcos' },
  { day: '2026-02-14', stageId: 'montana', startTime: '15:00', artist: 'Ryan' },
  { day: '2026-02-14', stageId: 'montana', startTime: '15:50', artist: 'Bersuit Vergarabat' },
  { day: '2026-02-14', stageId: 'montana', startTime: '17:10', artist: 'Marilina Bertoldi' },
  { day: '2026-02-14', stageId: 'montana', startTime: '18:40', artist: 'El Kuelgue' },
  { day: '2026-02-14', stageId: 'montana', startTime: '20:40', artist: 'Cuarteto de Nos' },
  { day: '2026-02-14', stageId: 'montana', startTime: '22:40', artist: 'Franz Ferdinand' },
  { day: '2026-02-14', stageId: 'montana', startTime: '00:00', artist: 'The Chemical Brothers (DJ Set)' },
  { day: '2026-02-14', stageId: 'montana', startTime: '02:00', artist: 'Victoria Whynot' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '14:10', artist: 'Microtul' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '14:50', artist: '1915' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '15:40', artist: 'Un Muerto Más' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '16:30', artist: 'Girl Ultra' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '17:20', artist: 'Hermanos Gutiérrez' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '18:20', artist: 'Indios' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '19:20', artist: 'Estelares' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '20:40', artist: 'Abel Pintos' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '21:50', artist: 'La Franela' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '23:10', artist: 'Coti' },
  { day: '2026-02-14', stageId: 'boomerang', startTime: '00:30', artist: 'Amigo de Artistas' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '14:15', artist: "Golo's Band" },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '15:05', artist: 'Los Mentidores' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '15:55', artist: 'Las Witches' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '16:50', artist: 'Le Dracs' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '17:45', artist: 'Perro Suizo' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '18:40', artist: 'Misty Soul Choir' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '19:35', artist: 'Tango & Roll' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '20:30', artist: 'Wayra Iglesias' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '21:25', artist: 'Los Espíritus' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '22:30', artist: 'Piti Fernández' },
  { day: '2026-02-14', stageId: 'casita-blues', startTime: '23:35', artist: 'Les Diabolettes' },
  { day: '2026-02-14', stageId: 'plaza-electronic', startTime: '16:00', artist: 'Claudio Ricci' },
  { day: '2026-02-14', stageId: 'plaza-electronic', startTime: '17:00', artist: 'Valentin Huedo B2B Bruz' },
  { day: '2026-02-14', stageId: 'plaza-electronic', startTime: '19:00', artist: 'Lehar B2B Santiago García' },
  { day: '2026-02-14', stageId: 'plaza-electronic', startTime: '21:00', artist: 'Sorä' },
  { day: '2026-02-14', stageId: 'plaza-electronic', startTime: '22:30', artist: 'Arkadyan' },
  { day: '2026-02-14', stageId: 'sorpresa', startTime: '15:50', artist: 'Falsed' },
  { day: '2026-02-14', stageId: 'sorpresa', startTime: '18:40', artist: 'Sorpresa' },
  { day: '2026-02-14', stageId: 'sorpresa', startTime: '22:20', artist: 'Sorpresa' },
  { day: '2026-02-15', stageId: 'norte', startTime: '14:30', artist: 'Sofi Mora' },
  { day: '2026-02-15', stageId: 'norte', startTime: '15:20', artist: 'Blair' },
  { day: '2026-02-15', stageId: 'norte', startTime: '16:30', artist: 'Gauchito Club' },
  { day: '2026-02-15', stageId: 'norte', startTime: '17:50', artist: 'Bándalos Chinos' },
  { day: '2026-02-15', stageId: 'norte', startTime: '19:10', artist: 'Fito Páez' },
  { day: '2026-02-15', stageId: 'norte', startTime: '20:55', artist: 'Airbag' },
  { day: '2026-02-15', stageId: 'norte', startTime: '23:00', artist: 'YSY A' },
  { day: '2026-02-15', stageId: 'norte', startTime: '00:20', artist: 'Caras Extrañas' },
  { day: '2026-02-15', stageId: 'sur', startTime: '14:20', artist: 'Ainda' },
  { day: '2026-02-15', stageId: 'sur', startTime: '15:10', artist: 'Kapanga' },
  { day: '2026-02-15', stageId: 'sur', startTime: '16:25', artist: 'Pappo x Juanse' },
  { day: '2026-02-15', stageId: 'sur', startTime: '17:45', artist: 'El Plan de la Mariposa' },
  { day: '2026-02-15', stageId: 'sur', startTime: '19:40', artist: 'Divididos' },
  { day: '2026-02-15', stageId: 'sur', startTime: '21:30', artist: 'Trueno' },
  { day: '2026-02-15', stageId: 'sur', startTime: '23:10', artist: 'Guasones' },
  { day: '2026-02-15', stageId: 'sur', startTime: '00:50', artist: 'Louta' },
  { day: '2026-02-15', stageId: 'montana', startTime: '14:30', artist: 'Renzo Leali' },
  { day: '2026-02-15', stageId: 'montana', startTime: '15:00', artist: 'Beats Modernos' },
  { day: '2026-02-15', stageId: 'montana', startTime: '15:50', artist: 'Gustavo Cordera' },
  { day: '2026-02-15', stageId: 'montana', startTime: '17:00', artist: 'Los Pericos' },
  { day: '2026-02-15', stageId: 'montana', startTime: '18:30', artist: 'Silvestre y La Naranja' },
  { day: '2026-02-15', stageId: 'montana', startTime: '20:20', artist: 'Morat' },
  { day: '2026-02-15', stageId: 'montana', startTime: '22:20', artist: 'Las Pastillas del Abuelo' },
  { day: '2026-02-15', stageId: 'montana', startTime: '00:00', artist: 'Peces Raros' },
  { day: '2026-02-15', stageId: 'montana', startTime: '01:00', artist: 'Mariano Mellino' },
  { day: '2026-02-15', stageId: 'montana', startTime: '02:00', artist: 'Franky Wah' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '14:20', artist: 'Wanda Jael' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '15:10', artist: 'T&K' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '16:10', artist: 'Malandro' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '17:20', artist: 'Gauchos of the Pampa' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '18:20', artist: 'Devendra Banhart' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '19:30', artist: 'Dum Chica' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '20:30', artist: 'Marky Ramone' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '21:35', artist: 'David Ellefson' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '22:35', artist: 'CTM' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '23:35', artist: 'Six Sex' },
  { day: '2026-02-15', stageId: 'paraguay', startTime: '00:45', artist: 'El Club de la Serpiente' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '14:15', artist: 'Rosy Gomeez' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '15:05', artist: 'Labios de Sal' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '15:55', artist: 'Rudy' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '16:50', artist: 'Bulldozer Blues Band' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '17:45', artist: "Cordelia's Blues" },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '18:40', artist: "Grasshopper's" },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '19:35', artist: 'Gisa Londero & Toyo Bagoso' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '20:40', artist: 'Crystal Thomas & Luca Giordano' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '21:45', artist: 'Nina Portela' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '22:40', artist: 'Xime Monzón' },
  { day: '2026-02-15', stageId: 'casita-blues', startTime: '23:35', artist: 'Loretta Sorbello' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '16:00', artist: 'Lourdes Lourdes' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '17:00', artist: 'Glauco Di Mambro' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '18:00', artist: 'Brigado Crew' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '19:30', artist: 'Deer Jade' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '21:00', artist: 'Franky Wah' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '22:30', artist: 'Kölsch' },
  { day: '2026-02-15', stageId: 'plaza-electronic', startTime: '00:00', artist: 'Matias Tanzmann' },
  { day: '2026-02-15', stageId: 'sorpresa', startTime: '15:50', artist: 'Golden Floyd' },
  { day: '2026-02-15', stageId: 'sorpresa', startTime: '17:10', artist: 'Sorpresa' },
  { day: '2026-02-15', stageId: 'sorpresa', startTime: '22:20', artist: 'Agarrate Catalina' },
];

export const getAppNow = (): Date => {
  return DEMO_TIME_ENABLED ? new Date(DEMO_DATE) : new Date();
};

export const getStageById = (stageId: StageId): FestivalStage => {
  const stage = festivalStages.find((item) => item.id === stageId);
  if (!stage) throw new Error(`Escenario desconocido: ${stageId}`);
  return stage;
};

export const getFestivalDay = (date: Date): FestivalDay | null => {
  const time = date.getTime();
  const day = festivalDays.find(({ id }) => {
    const start = getScheduleDate(id, '12:00').getTime();
    const end = getScheduleDate(id, '03:30').getTime();
    return time >= start && time <= end;
  });

  return day?.id ?? null;
};

export const getStages = (day: FestivalDay): FestivalStage[] => {
  const ids = new Set(festivalShows.filter((show) => show.day === day).map((show) => show.stageId));
  return festivalStages.filter((stage) => ids.has(stage.id));
};

export const getShowsForStage = (day: FestivalDay, stageId: StageId): ResolvedFestivalShow[] => {
  const shows = festivalShows
    .filter((show) => show.day === day && show.stageId === stageId)
    .sort((a, b) => getScheduleDate(a.day, a.startTime).getTime() - getScheduleDate(b.day, b.startTime).getTime());

  return shows.map((show, index) => resolveShow(show, shows[index + 1]));
};

export const getShowEndTime = (show: FestivalShow): Date => {
  const shows = festivalShows
    .filter((item) => item.day === show.day && item.stageId === show.stageId)
    .sort((a, b) => getScheduleDate(a.day, a.startTime).getTime() - getScheduleDate(b.day, b.startTime).getTime());
  const index = shows.findIndex(
    (item) => item.artist === show.artist && item.startTime === show.startTime && item.stageId === show.stageId,
  );
  const nextShow = index >= 0 ? shows[index + 1] : undefined;
  return nextShow ? getScheduleDate(nextShow.day, nextShow.startTime) : addMinutes(getScheduleDate(show.day, show.startTime), DEFAULT_LAST_SHOW_DURATION_MINUTES);
};

export const getCurrentShow = (
  day: FestivalDay,
  stageId: StageId,
  date: Date,
): ResolvedFestivalShow | null => {
  return (
    getShowsForStage(day, stageId).find((show) => {
      const time = date.getTime();
      return time >= show.startsAt.getTime() && time < show.endsAt.getTime();
    }) ?? null
  );
};

export const getNextShow = (
  day: FestivalDay,
  stageId: StageId,
  date: Date,
): ResolvedFestivalShow | null => {
  return getShowsForStage(day, stageId).find((show) => show.startsAt.getTime() > date.getTime()) ?? null;
};

export const getUpcomingShows = (
  day: FestivalDay,
  date: Date,
  limit = 5,
): ResolvedFestivalShow[] => {
  return getStages(day)
    .flatMap((stage) => getShowsForStage(day, stage.id))
    .filter((show) => show.startsAt.getTime() > date.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, limit);
};

export const getCurrentShowsAcrossStages = (
  day: FestivalDay,
  date: Date,
): CurrentShowAcrossStage[] => {
  return getStages(day)
    .map((stage) => {
      const show = getCurrentShow(day, stage.id, date);
      if (!show) return null;

      return {
        stageId: stage.id,
        stageName: stage.name,
        stageShortName: stage.shortName,
        show,
      };
    })
    .filter((item): item is CurrentShowAcrossStage => item !== null);
};

export const getShowStatus = (show: ResolvedFestivalShow, date: Date): ShowStatus => {
  const time = date.getTime();
  if (time >= show.startsAt.getTime() && time < show.endsAt.getTime()) return 'live';
  if (time < show.startsAt.getTime()) return 'upcoming';
  return 'finished';
};

export const getShowTemporalState = (show: ResolvedFestivalShow, date: Date): ShowTemporalState => {
  const festivalDay = getFestivalDay(date);
  const time = date.getTime();

  if (time >= show.endsAt.getTime()) return 'finished';
  if (festivalDay !== show.day) return time < show.startsAt.getTime() ? 'future-day' : 'finished';
  if (time >= show.startsAt.getTime()) return 'live';
  return 'upcoming-today';
};

export const canNavigateToShow = (show: ResolvedFestivalShow, date: Date): boolean => {
  const state = getShowTemporalState(show, date);
  return state === 'live' || state === 'upcoming-today';
};

export const getShowId = (show: FestivalShow): string => {
  return `${show.day}-${show.stageId}-${slugify(show.artist)}-${show.startTime.replace(':', '')}`;
};

export const formatTimeUntil = (show: ResolvedFestivalShow, date: Date): string => {
  const minutes = Math.max(0, Math.ceil((show.startsAt.getTime() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} MIN`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours} H` : `${hours} H ${remainingMinutes} MIN`;
};

export const formatShowTimeRange = (show: ResolvedFestivalShow): string => {
  return `${show.startTime} — ${formatClockTime(show.endsAt)}`;
};

export const formatClockTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);
};

const resolveShow = (show: FestivalShow, nextShow?: FestivalShow): ResolvedFestivalShow => {
  const startsAt = getScheduleDate(show.day, show.startTime);
  const endsAt = nextShow
    ? getScheduleDate(nextShow.day, nextShow.startTime)
    : addMinutes(startsAt, DEFAULT_LAST_SHOW_DURATION_MINUTES);

  return {
    ...show,
    id: getShowId(show),
    stage: getStageById(show.stageId),
    startsAt,
    endsAt,
  };
};

const getScheduleDate = (day: FestivalDay, time: string): Date => {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const date = new Date(`${day}T00:00:00-03:00`);

  if (hour < 12) {
    date.setDate(date.getDate() + 1);
  }

  date.setHours(hour, minute, 0, 0);
  return date;
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60_000);
};

const slugify = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
