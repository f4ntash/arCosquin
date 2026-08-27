import {
  festivalDays,
  getShowsForStage,
  getStages,
  type ResolvedFestivalShow,
} from './cosquinRock2026';

const FAVORITES_STORAGE_KEY = 'cosquin-rock-2026-favorites';

export const getFavoriteShowIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
};

export const isFavoriteShow = (showId: string): boolean => {
  return getFavoriteShowIds().includes(showId);
};

export const toggleFavoriteShow = (showId: string): boolean => {
  const favoriteIds = new Set(getFavoriteShowIds());

  if (favoriteIds.has(showId)) {
    favoriteIds.delete(showId);
  } else {
    favoriteIds.add(showId);
  }

  saveFavoriteShowIds([...favoriteIds]);
  return favoriteIds.has(showId);
};

export const getFavoriteShows = (): ResolvedFestivalShow[] => {
  const favoriteIds = new Set(getFavoriteShowIds());
  return getAllShows()
    .filter((show) => favoriteIds.has(show.id))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
};

export const getOverlappingFavoriteShowIds = (): Set<string> => {
  const shows = getFavoriteShows();
  const overlappingIds = new Set<string>();

  shows.forEach((show, index) => {
    shows.slice(index + 1).forEach((otherShow) => {
      if (show.startsAt < otherShow.endsAt && otherShow.startsAt < show.endsAt) {
        overlappingIds.add(show.id);
        overlappingIds.add(otherShow.id);
      }
    });
  });

  return overlappingIds;
};

const saveFavoriteShowIds = (favoriteIds: string[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
};

const getAllShows = (): ResolvedFestivalShow[] => {
  return festivalDays.flatMap((day) => getStages(day.id).flatMap((stage) => getShowsForStage(day.id, stage.id)));
};
