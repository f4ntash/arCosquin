import './styles.css';
import { ARExperience } from './ar/ARExperience';
import { DEBUG_NAVIGATION, DEFAULT_DEMO_STAGE_ID, DEMO_STAGE_LOCATIONS, getStageNavigationConfig } from './config/navigation';
import {
  canNavigateToShow,
  festivalDays,
  formatTimeUntil,
  formatShowTimeRange,
  getAppNow,
  getCurrentShowsAcrossStages,
  getFestivalDay,
  getShowsForStage,
  getStageById,
  getShowTemporalState,
  getStages,
  getUpcomingShows,
  type FestivalDay,
  type ResolvedFestivalShow,
  type ShowTemporalState,
  type StageId,
} from './data/cosquinRock2026';
import {
  getFavoriteShowIds,
  getFavoriteShows,
  getOverlappingFavoriteShowIds,
  isFavoriteShow,
  toggleFavoriteShow,
} from './data/favoriteShows';
import { NavigationController } from './navigation/NavigationController';
import { calculateShortestAngleDelta, formatDistance } from './navigation/navigationMath';
import type { NavigationState } from './navigation/navigationTypes';
import { registerOfflineSupport, type OfflineStatus } from './offline/registerServiceWorker';

type StatusMode = 'idle' | 'starting' | 'scanning' | 'found' | 'error';
type ExperienceMode = 'scanning' | 'target' | 'navigation';
type SheetType = 'schedule' | 'map' | 'favorites';
type NavigationSelection = {
  stageId: StageId;
  show?: ResolvedFestivalShow;
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('No se encontró el contenedor #app.');
}

let experience: ARExperience | null = null;
let navigation: NavigationController | null = null;
let badgeTimeout = 0;
let mode: ExperienceMode = 'scanning';
let hasActivatedExperience = false;
let targetArrowRotation = 0;
let currentArrowRotation = 0;
let arrowAnimationFrame = 0;
let selectedScheduleDay: FestivalDay = getActiveFestivalDay();
let selectedScheduleStageId: StageId = DEFAULT_DEMO_STAGE_ID;
let selectedNavigation: NavigationSelection | null = null;
let offlineToastTimeout = 0;

function getActiveFestivalDay(): FestivalDay {
  return getFestivalDay(getAppNow()) ?? festivalDays[0].id;
}

const escapeHtml = (value: string): string => {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
};

const findShowByKey = (key: string | undefined): ResolvedFestivalShow | null => {
  if (!key) return null;

  return (
    festivalDays
      .flatMap((day) => getStages(day.id).flatMap((stage) => getShowsForStage(day.id, stage.id)))
      .find((show) => show.id === key) ?? null
  );
};

const getDefaultNavigationShow = (): ResolvedFestivalShow | null => {
  const now = getAppNow();
  const day = getActiveFestivalDay();
  return getCurrentShowsAcrossStages(day, now)[0]?.show ?? getUpcomingShows(day, now, 1)[0] ?? null;
};

const getNavigationShow = (): ResolvedFestivalShow | null => {
  return selectedNavigation?.show ?? getDefaultNavigationShow();
};

const getNavigationStageId = (): StageId => {
  return selectedNavigation?.stageId ?? getNavigationShow()?.stageId ?? DEFAULT_DEMO_STAGE_ID;
};

const getStatusLabel = (status: ShowTemporalState, show: ResolvedFestivalShow, now: Date): string => {
  if (status === 'live') return '● EN VIVO';
  if (status === 'upcoming-today') return `EN ${formatTimeUntil(show, now)}`;
  if (status === 'future-day') return getFutureDayLabel(show.day);
  return 'FINALIZADO';
};

const getFutureDayLabel = (day: FestivalDay): string => {
  const currentDay = getActiveFestivalDay();
  const currentIndex = festivalDays.findIndex((item) => item.id === currentDay);
  const showIndex = festivalDays.findIndex((item) => item.id === day);
  if (currentIndex >= 0 && showIndex === currentIndex + 1) return 'MAÑANA';
  return festivalDays.find((item) => item.id === day)?.label ?? day;
};

const renderShell = (): void => {
  app.innerHTML = `
    <main class="app-shell" aria-live="polite">
      <section class="intro-screen" data-view="intro">
        <div class="intro-copy">
          <p class="kicker">CORSTENO LABS</p>
          <h1>
            <span>COSQUÍN ROCK</span>
            <span>AR CONCEPT</span>
          </h1>
          <p class="subtitle">Experiencia conceptual de realidad aumentada</p>
        </div>
        <div class="intro-actions">
          <button class="start-button" type="button">INICIAR EXPERIENCIA</button>
          <p>Necesitaremos acceso a tu cámara.</p>
        </div>
      </section>

      <section class="ar-screen" data-view="ar" hidden>
        <div class="ar-stage" data-ar-stage></div>
        <button class="close-button" type="button" aria-label="Cerrar experiencia AR">×</button>
        <div class="tracking-hint" data-status>
          <strong data-status-title>APUNTÁ AL CARTEL</strong>
          <span data-status-detail>Buscando imagen...</span>
        </div>
        <section class="now-section" data-now-section hidden>
          <header class="now-section__header">
            <div>
              <span>COSQUÍN ROCK 2026</span>
              <strong>AHORA EN COSQUÍN</strong>
            </div>
            <button class="favorites-open-button" type="button" data-open-favorites>★ MI GRILLA</button>
          </header>
          <div class="now-show-rail" data-current-shows></div>
        </section>
        <div class="navigation-overlay" data-navigation-overlay hidden>
          <header class="navigation-header">
            <strong>COSQUÍN ROCK</strong>
            <span>NAVEGACIÓN</span>
          </header>
          <div class="navigation-core">
            <div class="navigation-arrow" data-navigation-arrow>↑</div>
            <strong data-navigation-destination>ESCENARIO</strong>
            <span data-navigation-distance>Buscando ubicación...</span>
            <p data-navigation-instruction>Buscando orientación...</p>
            <article class="navigation-artist-card">
              <span data-navigation-show-label>SHOW</span>
              <strong data-navigation-show-artist>Seleccioná un show</strong>
              <small data-navigation-show-meta>Elegí una banda para navegar</small>
            </article>
          </div>
          <footer class="navigation-footer">
            <p class="navigation-gps-pill" data-navigation-error hidden></p>
            <nav class="navigation-actions" aria-label="Controles de navegación">
              <button class="navigation-action-button" type="button" data-open-schedule>GRILLA</button>
              <button class="navigation-action-button" type="button" data-open-favorites-nav>★ MI GRILLA</button>
              <button class="navigation-action-button" type="button" data-exit-navigation>SALIR</button>
            </nav>
          </footer>
          <pre class="navigation-debug" data-navigation-debug ${DEBUG_NAVIGATION ? '' : 'hidden'}></pre>
        </div>
        <div class="bottom-sheet-backdrop" data-sheet-backdrop hidden></div>
        <section class="bottom-sheet" data-bottom-sheet hidden aria-modal="true" role="dialog">
          <div class="sheet-handle"></div>
          <div class="sheet-content" data-sheet-content></div>
          <button class="sheet-close-button" type="button" data-close-sheet>CERRAR</button>
        </section>
        <div class="target-badge" data-target-badge hidden>TARGET DETECTADO</div>
      </section>
      <div class="offline-toast" data-offline-toast hidden></div>
    </main>
  `;

  const startButton = app.querySelector<HTMLButtonElement>('.start-button');
  const closeButton = app.querySelector<HTMLButtonElement>('.close-button');
  const exitNavigationButton = app.querySelector<HTMLButtonElement>('[data-exit-navigation]');
  const scheduleButton = app.querySelector<HTMLButtonElement>('[data-open-schedule]');
  const navigationFavoritesButton = app.querySelector<HTMLButtonElement>('[data-open-favorites-nav]');
  const favoritesButton = app.querySelector<HTMLButtonElement>('[data-open-favorites]');
  const closeSheetButton = app.querySelector<HTMLButtonElement>('[data-close-sheet]');
  const sheetBackdrop = app.querySelector<HTMLElement>('[data-sheet-backdrop]');

  startButton?.addEventListener('click', startExperience);
  closeButton?.addEventListener('click', closeExperience);
  exitNavigationButton?.addEventListener('click', exitNavigationMode);
  scheduleButton?.addEventListener('click', () => openSheet('schedule'));
  navigationFavoritesButton?.addEventListener('click', () => openSheet('favorites'));
  favoritesButton?.addEventListener('click', () => openSheet('favorites'));
  closeSheetButton?.addEventListener('click', closeSheet);
  sheetBackdrop?.addEventListener('click', closeSheet);
  updateFestivalUi();
};

const setView = (view: 'intro' | 'ar'): void => {
  const intro = app.querySelector<HTMLElement>('[data-view="intro"]');
  const ar = app.querySelector<HTMLElement>('[data-view="ar"]');

  if (intro) intro.hidden = view !== 'intro';
  if (ar) ar.hidden = view !== 'ar';
};

const setStatus = (mode: StatusMode, message?: string): void => {
  const status = app.querySelector<HTMLElement>('[data-status]');
  const title = app.querySelector<HTMLElement>('[data-status-title]');
  const detail = app.querySelector<HTMLElement>('[data-status-detail]');

  if (!status || !title || !detail) return;

  status.dataset.mode = mode;

  if (mode === 'starting') {
    title.textContent = 'INICIANDO CÁMARA...';
    detail.textContent = '';
    return;
  }

  if (mode === 'error') {
    title.textContent = 'ERROR DE DESARROLLO';
    detail.textContent = message ?? '';
    return;
  }

  title.textContent = 'APUNTÁ AL CARTEL';
  detail.textContent = mode === 'found' ? '' : 'Buscando imagen...';
};

const updateFestivalUi = (): void => {
  const now = getAppNow();
  const day = getActiveFestivalDay();
  const currentShows = getCurrentShowsAcrossStages(day, now);
  const currentShowsContainer = app.querySelector<HTMLElement>('[data-current-shows]');
  const favoritesButton = app.querySelector<HTMLElement>('[data-open-favorites]');
  const navigationFavoritesButton = app.querySelector<HTMLElement>('[data-open-favorites-nav]');
  const favoriteCount = getFavoriteShowIds().length;

  if (favoritesButton) {
    favoritesButton.textContent = favoriteCount > 0 ? `★ MI GRILLA · ${favoriteCount}` : '★ MI GRILLA';
  }
  if (navigationFavoritesButton) {
    navigationFavoritesButton.textContent = favoriteCount > 0 ? `★ ${favoriteCount}` : '★ MI GRILLA';
  }

  if (currentShowsContainer) {
    currentShowsContainer.innerHTML =
      currentShows.length > 0
        ? currentShows
            .map(
              ({ stageName, stageShortName, show }) => `
                <article class="now-show-card" data-show-card="${escapeHtml(show.id)}">
                  <div class="show-card-topline">
                    <span class="show-status show-status--live">● EN VIVO</span>
                    ${renderFavoriteButton(show)}
                  </div>
                  <strong>${escapeHtml(show.artist)}</strong>
                  <small>${escapeHtml(stageName)}</small>
                  <time>${escapeHtml(formatShowTimeRange(show))}</time>
                  <button type="button" data-navigate-show="${escapeHtml(show.id)}">
                    IR A ESTE SHOW
                    <span>${escapeHtml(stageShortName)}</span>
                  </button>
                </article>
              `,
            )
            .join('')
        : `
          <div class="now-empty">
            <strong>NO HAY SHOWS EN VIVO EN ESTE MOMENTO</strong>
            <span>Revisá los próximos shows para elegir destino.</span>
          </div>
        `;
  }

  bindNavigationButtons(app);
  updateNavigationShowCard();
};

const bindNavigationButtons = (root: ParentNode): void => {
  root.querySelectorAll<HTMLButtonElement>('[data-toggle-favorite]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavoriteShow(button.dataset.toggleFavorite ?? '');
      updateFestivalUi();
      const content = app.querySelector<HTMLElement>('[data-sheet-content]');
      if (content?.dataset.sheetType === 'schedule') renderScheduleSheet(content);
      if (content?.dataset.sheetType === 'favorites') renderFavoritesSheet(content);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-navigate-show]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const show = findShowByKey(button.dataset.navigateShow);
      if (show) {
        void startNavigationToShow(show);
      }
    });
  });

  root.querySelectorAll<HTMLElement>('[data-show-card]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target instanceof HTMLButtonElement) return;

      const show = findShowByKey(card.dataset.showCard);
      if (show) {
        void startNavigationToShow(show);
      }
    });
  });
};

const renderFavoriteButton = (show: ResolvedFestivalShow): string => {
  const favorite = isFavoriteShow(show.id);
  return `
    <button
      class="favorite-button ${favorite ? 'is-active' : ''}"
      type="button"
      aria-label="${favorite ? 'Quitar de Mi Grilla' : 'Agregar a Mi Grilla'}"
      data-toggle-favorite="${escapeHtml(show.id)}"
    >
      ${favorite ? '★' : '☆'}
    </button>
  `;
};

const updateNavigationShowCard = (): void => {
  const show = getNavigationShow();
  const now = getAppNow();
  const label = show ? getStatusLabel(getShowTemporalState(show, now), show, now) : 'SHOW';
  const artist = show?.artist ?? 'Seleccioná un show';
  const meta = show ? `${show.stage.name} · ${formatShowTimeRange(show)}` : 'Elegí una banda para navegar';
  const navigationShowLabel = app.querySelector<HTMLElement>('[data-navigation-show-label]');
  const navigationShowArtist = app.querySelector<HTMLElement>('[data-navigation-show-artist]');
  const navigationShowMeta = app.querySelector<HTMLElement>('[data-navigation-show-meta]');

  if (navigationShowLabel) navigationShowLabel.textContent = label;
  if (navigationShowArtist) navigationShowArtist.textContent = artist;
  if (navigationShowMeta) navigationShowMeta.textContent = meta;
};

const startNavigationToShow = async (show: ResolvedFestivalShow): Promise<void> => {
  selectedNavigation = {
    stageId: show.stageId,
    show,
  };
  selectedScheduleDay = show.day;
  selectedScheduleStageId = show.stageId;
  closeSheet();

  if (mode === 'navigation' && navigation) {
    updateNavigationShowCard();
    navigation.setDestinationStage(show.stageId);
    updateNavigationOverlay(createDemoNavigationState());
    return;
  }

  await enterNavigationMode();
};

const setMode = (nextMode: ExperienceMode): void => {
  mode = nextMode;

  const nowSection = app.querySelector<HTMLElement>('[data-now-section]');
  const navigationOverlay = app.querySelector<HTMLElement>('[data-navigation-overlay]');

  if (nowSection) nowSection.hidden = nextMode !== 'target';
  if (navigationOverlay) navigationOverlay.hidden = nextMode !== 'navigation';

  if (nextMode === 'navigation') {
    setStatus('found');
  } else {
    setStatus(nextMode === 'target' ? 'found' : 'scanning');
  }
};

const showTargetBadge = (): void => {
  const badge = app.querySelector<HTMLElement>('[data-target-badge]');
  if (!badge) return;

  window.clearTimeout(badgeTimeout);
  badge.hidden = false;
  badgeTimeout = window.setTimeout(() => {
    badge.hidden = true;
  }, 1400);
};

const showOfflineStatus = (status: OfflineStatus): void => {
  const toast = app.querySelector<HTMLElement>('[data-offline-toast]');
  if (!toast) return;

  window.clearTimeout(offlineToastTimeout);

  if (status === 'offline') {
    toast.textContent = 'MODO OFFLINE';
    toast.hidden = false;
    return;
  }

  if (status === 'online') {
    toast.hidden = true;
    toast.textContent = '';
    return;
  }

  if (status === 'ready') {
    toast.textContent = '✓ LISTO PARA USAR OFFLINE';
    toast.hidden = false;
    offlineToastTimeout = window.setTimeout(() => {
      if (navigator.onLine) {
        toast.hidden = true;
        toast.textContent = '';
      }
    }, 3600);
  }
};

const startExperience = async (): Promise<void> => {
  const stage = app.querySelector<HTMLElement>('[data-ar-stage]');
  if (!stage) return;

  setView('ar');
  setMode('scanning');
  setStatus('starting');
  selectedScheduleDay = getActiveFestivalDay();
  selectedScheduleStageId = DEFAULT_DEMO_STAGE_ID;
  selectedNavigation = null;
  updateFestivalUi();
  hasActivatedExperience = false;

  experience = new ARExperience(stage, {
    onReady: () => setMode('scanning'),
    onTargetFound: () => {
      hasActivatedExperience = true;
      if (mode !== 'navigation') {
        setMode('target');
      }
      showTargetBadge();
    },
    onTargetLost: () => {
      if (!hasActivatedExperience) {
        setMode('scanning');
        return;
      }

      if (mode !== 'navigation') {
        setMode('target');
      }
    },
    onError: (message) => setStatus('error', message),
  });

  await experience.start();
};

const enterNavigationMode = async (): Promise<void> => {
  clearNavigationError();

  const stageId = getNavigationStageId();
  updateNavigationShowCard();

  navigation?.stop();
  navigation = new NavigationController(
    {
      onUpdate: updateNavigationOverlay,
      onError: showNavigationError,
    },
    stageId,
  );

  try {
    await navigation.start();
  } catch (error) {
    showNavigationError(error instanceof Error ? error.message : 'No se pudo iniciar la navegación.');
  }

  setMode('navigation');
  updateNavigationOverlay(createDemoNavigationState());
};

const exitNavigationMode = (): void => {
  navigation?.stop();
  navigation = null;
  stopArrowAnimation();
  clearNavigationOverlay();
  selectedNavigation = null;
  updateFestivalUi();
  setMode(hasActivatedExperience ? 'target' : 'scanning');
};

const closeExperience = (): void => {
  window.clearTimeout(badgeTimeout);
  navigation?.stop();
  navigation = null;
  experience?.stop();
  experience = null;
  mode = 'scanning';
  hasActivatedExperience = false;
  selectedNavigation = null;
  stopArrowAnimation();
  clearNavigationOverlay();
  closeSheet();
  setView('intro');
  setStatus('idle');
};

const updateNavigationOverlay = (state: NavigationState): void => {
  const arrow = app.querySelector<HTMLElement>('[data-navigation-arrow]');
  const destination = app.querySelector<HTMLElement>('[data-navigation-destination]');
  const distance = app.querySelector<HTMLElement>('[data-navigation-distance]');
  const instruction = app.querySelector<HTMLElement>('[data-navigation-instruction]');
  const debug = app.querySelector<HTMLElement>('[data-navigation-debug]');

  if (arrow && state.relativeBearing !== null) {
    targetArrowRotation = state.relativeBearing;
    startArrowAnimation();
  }

  if (destination) destination.textContent = state.destinationName;
  if (distance) distance.textContent = formatDistance(state.distanceMeters);
  if (instruction) instruction.textContent = toFriendlyInstruction(state.instruction);
  if (state.statusMessage) {
    showNavigationError(state.statusMessage);
  } else if (state.position !== null) {
    clearNavigationError();
  }

  if (debug && DEBUG_NAVIGATION) {
    debug.textContent = [
      `LAT ${state.position?.latitude.toFixed(6) ?? '--'}`,
      `LNG ${state.position?.longitude.toFixed(6) ?? '--'}`,
      `GPS ACCURACY ${state.position ? `${Math.round(state.position.accuracy)}m` : '--'}`,
      `HEADING ${state.heading?.toFixed(1) ?? '--'}`,
      `DESTINATION BEARING ${state.destinationBearing?.toFixed(1) ?? '--'}`,
      `RELATIVE BEARING ${state.relativeBearing?.toFixed(1) ?? '--'}`,
    ].join('\n');
  }
};

const showNavigationError = (message: string): void => {
  const error = app.querySelector<HTMLElement>('[data-navigation-error]');
  if (!error) return;

  error.hidden = false;
  error.textContent =
    message === 'Solicitando ubicación...'
      ? 'Solicitando ubicación...'
      : message === 'Buscando ubicación...'
        ? 'Buscando GPS · modo demo'
        : 'GPS no disponible · modo demo';
};

const toFriendlyInstruction = (instruction: string): string => {
  if (instruction === 'SEGUÍ DERECHO') return 'Seguí en esta dirección';
  if (instruction === 'GIRÁ HACIA LA DERECHA') return 'Girás a la derecha';
  if (instruction === 'GIRÁ HACIA LA IZQUIERDA') return 'Girás a la izquierda';
  if (instruction === 'GIRÁ Y CONTINUÁ EN SENTIDO CONTRARIO') return 'Girás y continuás atrás';
  return instruction;
};

const clearNavigationError = (): void => {
  const error = app.querySelector<HTMLElement>('[data-navigation-error]');
  if (!error) return;

  error.hidden = true;
  error.textContent = '';
};

const startArrowAnimation = (): void => {
  if (arrowAnimationFrame) return;

  const tick = (): void => {
    const arrow = app.querySelector<HTMLElement>('[data-navigation-arrow]');
    const delta = calculateShortestAngleDelta(currentArrowRotation, targetArrowRotation);
    currentArrowRotation += delta * 0.16;

    if (arrow) {
      arrow.style.transform = `rotate(${currentArrowRotation}deg)`;
    }

    if (Math.abs(delta) < 0.1) {
      currentArrowRotation = targetArrowRotation;
      if (arrow) arrow.style.transform = `rotate(${currentArrowRotation}deg)`;
      arrowAnimationFrame = 0;
      return;
    }

    arrowAnimationFrame = requestAnimationFrame(tick);
  };

  arrowAnimationFrame = requestAnimationFrame(tick);
};

const stopArrowAnimation = (): void => {
  if (arrowAnimationFrame) {
    cancelAnimationFrame(arrowAnimationFrame);
    arrowAnimationFrame = 0;
  }

  targetArrowRotation = 0;
  currentArrowRotation = 0;
};

const clearNavigationOverlay = (): void => {
  clearNavigationError();
  updateNavigationOverlay(createDemoNavigationState());
};

const createDemoNavigationState = (): NavigationState => {
  const stageId = getNavigationStageId();
  const stage = getStageById(stageId);
  const destinationConfig = getStageNavigationConfig(stageId);

  return {
    destinationName: stage.name.toUpperCase(),
    position: null,
    heading: 0,
    destinationBearing: null,
    relativeBearing: destinationConfig.demoBearingDegrees,
    distanceMeters: destinationConfig.demoDistanceMeters,
    instruction: 'SEGUÍ DERECHO',
    statusMessage: '',
  };
};

const openSheet = (type: SheetType): void => {
  const sheet = app.querySelector<HTMLElement>('[data-bottom-sheet]');
  const backdrop = app.querySelector<HTMLElement>('[data-sheet-backdrop]');
  const content = app.querySelector<HTMLElement>('[data-sheet-content]');
  if (!sheet || !backdrop || !content) return;

  content.dataset.sheetType = type;

  if (type === 'schedule') {
    renderScheduleSheet(content);
  } else if (type === 'map') {
    renderMapSheet(content);
  } else {
    renderFavoritesSheet(content);
  }

  backdrop.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => {
    sheet.dataset.open = 'true';
    backdrop.dataset.open = 'true';
  });
};

const renderScheduleSheet = (content: HTMLElement): void => {
  const now = getAppNow();
  const stages = getStages(selectedScheduleDay);
  const selectedStage = stages.some((stage) => stage.id === selectedScheduleStageId)
    ? selectedScheduleStageId
    : stages[0]?.id;

  if (!selectedStage) {
    content.innerHTML = '<h2>GRILLA</h2><p class="sheet-empty">No hay shows cargados para este día.</p>';
    return;
  }

  selectedScheduleStageId = selectedStage;

  const selectedDayLabel =
    festivalDays.find((day) => day.id === selectedScheduleDay)?.fullLabel ?? 'GRILLA COSQUÍN ROCK';
  const shows = getShowsForStage(selectedScheduleDay, selectedScheduleStageId);

  content.innerHTML = `
    <h2>${escapeHtml(selectedDayLabel)}</h2>
    <div class="schedule-tabs" aria-label="Días del festival">
      ${festivalDays
        .map(
          (day) => `
            <button
              class="${day.id === selectedScheduleDay ? 'is-active' : ''}"
              type="button"
              data-schedule-day="${day.id}"
            >
              ${escapeHtml(day.label)}
            </button>
          `,
        )
        .join('')}
    </div>
    <div class="stage-tabs" aria-label="Escenarios">
      ${stages
        .map(
          (stage) => `
            <button
              class="${stage.id === selectedScheduleStageId ? 'is-active' : ''}"
              type="button"
              data-schedule-stage="${stage.id}"
            >
              ${escapeHtml(stage.shortName)}
            </button>
          `,
        )
        .join('')}
    </div>
    <div class="sheet-scroll-area">
      <div class="schedule-list">
        ${shows
        .map((show) => {
          const status = getShowTemporalState(show, now);
          const isCurrent = status === 'live';
          const canNavigate = canNavigateToShow(show, now);
          const statusLabel = getStatusLabel(status, show, now);
          return `
            <p class="${isCurrent ? 'is-current' : ''}">
              <time>${escapeHtml(show.startTime)}</time>
              <strong>${escapeHtml(show.artist)}</strong>
              <span>${escapeHtml(`${show.stage.shortName} · ${formatShowTimeRange(show)} · ${statusLabel}`)}</span>
              ${renderFavoriteButton(show)}
              ${
                canNavigate
                  ? `<button class="show-route-button" type="button" data-navigate-show="${escapeHtml(show.id)}">IR A ESTE SHOW</button>`
                  : ''
              }
            </p>
          `;
        })
        .join('')}
      </div>
    </div>
  `;

  content.querySelectorAll<HTMLButtonElement>('[data-schedule-day]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedScheduleDay = button.dataset.scheduleDay as FestivalDay;
      selectedScheduleStageId = DEFAULT_DEMO_STAGE_ID;
      renderScheduleSheet(content);
    });
  });

  content.querySelectorAll<HTMLButtonElement>('[data-schedule-stage]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedScheduleStageId = button.dataset.scheduleStage as StageId;
      renderScheduleSheet(content);
    });
  });

  bindNavigationButtons(content);
};

const renderFavoritesSheet = (content: HTMLElement): void => {
  const now = getAppNow();
  const favoriteShows = getFavoriteShows();
  const overlappingIds = getOverlappingFavoriteShowIds();

  if (favoriteShows.length === 0) {
    content.innerHTML = `
      <h2>MI GRILLA</h2>
      <div class="sheet-scroll-area">
        <div class="favorites-empty">
          <strong>TODAVÍA NO ARMASTE TU GRILLA</strong>
          <span>Tocá ☆ en las bandas que querés ver.</span>
          <button type="button" data-open-full-schedule>VER GRILLA COMPLETA</button>
        </div>
      </div>
    `;
    content.querySelector<HTMLButtonElement>('[data-open-full-schedule]')?.addEventListener('click', () => {
      openSheet('schedule');
    });
    return;
  }

  content.innerHTML = `
    <h2>MI GRILLA</h2>
    <div class="sheet-scroll-area">
      <div class="favorites-list">
        ${festivalDays
          .map((day) => {
            const shows = favoriteShows.filter((show) => show.day === day.id);
            if (shows.length === 0) return '';

            return `
              <section class="favorites-day">
                <h3>${escapeHtml(day.fullLabel)}</h3>
                <div class="schedule-list">
                  ${shows
                    .map((show) => {
                      const status = getShowTemporalState(show, now);
                      const canNavigate = canNavigateToShow(show, now);
                      const statusLabel = getStatusLabel(status, show, now);
                      return `
                        <p class="${status === 'live' ? 'is-current' : ''}">
                          <time>${escapeHtml(show.startTime)}</time>
                          <strong>${escapeHtml(show.artist)}</strong>
                          <span>${escapeHtml(`${show.stage.shortName} · ${formatShowTimeRange(show)} · ${statusLabel}`)}${
                            overlappingIds.has(show.id) ? '<em>⚠ SE SUPERPONE</em>' : ''
                          }</span>
                          ${renderFavoriteButton(show)}
                          ${
                            canNavigate
                              ? `<button class="show-route-button" type="button" data-navigate-show="${escapeHtml(show.id)}">IR</button>`
                              : ''
                          }
                        </p>
                      `;
                    })
                    .join('')}
                </div>
              </section>
            `;
          })
          .join('')}
      </div>
    </div>
  `;

  bindNavigationButtons(content);
};

const renderMapSheet = (content: HTMLElement): void => {
  const stages = getStages(getActiveFestivalDay());

  content.innerHTML = `
    <h2>MAPA DEL PREDIO</h2>
    <div class="sheet-scroll-area">
      <div class="map-list">
        ${stages
          .map(
            (stage) => `
              <p>
                <strong>${escapeHtml(stage.shortName)}</strong>
                <span>${escapeHtml(formatDistance(DEMO_STAGE_LOCATIONS[stage.id].demoDistanceMeters))}</span>
              </p>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
};

const closeSheet = (): void => {
  const sheet = app.querySelector<HTMLElement>('[data-bottom-sheet]');
  const backdrop = app.querySelector<HTMLElement>('[data-sheet-backdrop]');
  if (!sheet || !backdrop) return;

  sheet.dataset.open = 'false';
  backdrop.dataset.open = 'false';
  window.setTimeout(() => {
    sheet.hidden = true;
    backdrop.hidden = true;
  }, 180);
};

renderShell();

if (import.meta.env.PROD) {
  void registerOfflineSupport(showOfflineStatus);
}
