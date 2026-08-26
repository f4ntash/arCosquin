import './styles.css';
import { ARExperience } from './ar/ARExperience';
import { DEBUG_NAVIGATION } from './config/navigation';
import { NavigationController } from './navigation/NavigationController';
import { calculateShortestAngleDelta, formatDistance } from './navigation/navigationMath';
import type { NavigationState } from './navigation/navigationTypes';

type StatusMode = 'idle' | 'starting' | 'scanning' | 'found' | 'error';
type ExperienceMode = 'scanning' | 'target' | 'navigation';

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
        <article class="artist-card" data-artist-card hidden>
          <span class="artist-card__eyebrow">AHORA</span>
          <strong class="artist-card__name">BABASÓNICOS</strong>
          <span class="artist-card__meta">Escenario Norte</span>
          <span class="artist-card__time">19:00 — 20:00</span>
          <button class="route-button" type="button" data-route-button>CÓMO LLEGAR</button>
        </article>
        <div class="navigation-overlay" data-navigation-overlay hidden>
          <header class="navigation-header">
            <strong>COSQUÍN ROCK</strong>
            <span>NAVEGACIÓN</span>
          </header>
          <div class="navigation-core">
            <div class="navigation-arrow" data-navigation-arrow>↑</div>
            <strong data-navigation-destination>ESCENARIO NORTE</strong>
            <span data-navigation-distance>Buscando ubicación...</span>
            <p data-navigation-instruction>Buscando orientación...</p>
            <article class="navigation-artist-card">
              <span>AHORA</span>
              <strong>BABASÓNICOS</strong>
              <small>Escenario Norte · 19:00 — 20:00</small>
            </article>
          </div>
          <footer class="navigation-footer">
            <p class="navigation-gps-pill" data-navigation-error hidden></p>
            <nav class="navigation-actions" aria-label="Controles de navegación">
              <button class="navigation-action-button" type="button" data-open-schedule>GRILLA</button>
              <button class="navigation-action-button" type="button" data-open-map>MAPA</button>
              <button class="navigation-action-button" type="button" data-exit-navigation>SALIR</button>
            </nav>
          </footer>
          <pre class="navigation-debug" data-navigation-debug ${DEBUG_NAVIGATION ? '' : 'hidden'}></pre>
        </div>
        <div class="bottom-sheet-backdrop" data-sheet-backdrop hidden></div>
        <section class="bottom-sheet" data-bottom-sheet hidden aria-modal="true" role="dialog">
          <div class="sheet-handle"></div>
          <div data-sheet-content></div>
          <button class="sheet-close-button" type="button" data-close-sheet>CERRAR</button>
        </section>
        <div class="target-badge" data-target-badge hidden>TARGET DETECTADO</div>
      </section>
    </main>
  `;

  const startButton = app.querySelector<HTMLButtonElement>('.start-button');
  const closeButton = app.querySelector<HTMLButtonElement>('.close-button');
  const routeButton = app.querySelector<HTMLButtonElement>('[data-route-button]');
  const exitNavigationButton = app.querySelector<HTMLButtonElement>('[data-exit-navigation]');
  const scheduleButton = app.querySelector<HTMLButtonElement>('[data-open-schedule]');
  const mapButton = app.querySelector<HTMLButtonElement>('[data-open-map]');
  const closeSheetButton = app.querySelector<HTMLButtonElement>('[data-close-sheet]');
  const sheetBackdrop = app.querySelector<HTMLElement>('[data-sheet-backdrop]');

  startButton?.addEventListener('click', startExperience);
  closeButton?.addEventListener('click', closeExperience);
  routeButton?.addEventListener('click', () => {
    void enterNavigationMode();
  });
  exitNavigationButton?.addEventListener('click', exitNavigationMode);
  scheduleButton?.addEventListener('click', () => openSheet('schedule'));
  mapButton?.addEventListener('click', () => openSheet('map'));
  closeSheetButton?.addEventListener('click', closeSheet);
  sheetBackdrop?.addEventListener('click', closeSheet);
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

const setMode = (nextMode: ExperienceMode): void => {
  mode = nextMode;

  const routeButton = app.querySelector<HTMLElement>('[data-route-button]');
  const artistCard = app.querySelector<HTMLElement>('[data-artist-card]');
  const navigationOverlay = app.querySelector<HTMLElement>('[data-navigation-overlay]');

  if (artistCard) artistCard.hidden = nextMode !== 'target';
  if (routeButton) routeButton.hidden = nextMode !== 'target';
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

const startExperience = async (): Promise<void> => {
  const stage = app.querySelector<HTMLElement>('[data-ar-stage]');
  if (!stage) return;

  setView('ar');
  setMode('scanning');
  setStatus('starting');
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

  if (!navigation) {
    navigation = new NavigationController({
      onUpdate: updateNavigationOverlay,
      onError: showNavigationError,
    });

    try {
      await navigation.start();
    } catch (error) {
      showNavigationError(error instanceof Error ? error.message : 'No se pudo iniciar la navegación.');
    }
  }

  setMode('navigation');
  updateNavigationOverlay(createDemoNavigationState());
};

const exitNavigationMode = (): void => {
  navigation?.stop();
  navigation = null;
  stopArrowAnimation();
  clearNavigationOverlay();
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
  return {
    destinationName: 'ESCENARIO NORTE',
    position: null,
    heading: 0,
    destinationBearing: null,
    relativeBearing: 0,
    distanceMeters: 320,
    instruction: 'SEGUÍ DERECHO',
    statusMessage: '',
  };
};

const openSheet = (type: 'schedule' | 'map'): void => {
  const sheet = app.querySelector<HTMLElement>('[data-bottom-sheet]');
  const backdrop = app.querySelector<HTMLElement>('[data-sheet-backdrop]');
  const content = app.querySelector<HTMLElement>('[data-sheet-content]');
  if (!sheet || !backdrop || !content) return;

  content.innerHTML =
    type === 'schedule'
      ? `
        <h2>HOY</h2>
        <div class="schedule-list">
          <p><time>19:00</time><strong>BABASÓNICOS</strong><span>NORTE · EN VIVO</span></p>
          <p><time>20:15</time><strong>AIRBAG</strong><span>SUR</span></p>
          <p><time>21:30</time><strong>DIVIDIDOS</strong><span>NORTE</span></p>
          <p><time>22:45</time><strong>WOS</strong><span>MONTAÑA</span></p>
        </div>
      `
      : `
        <h2>MAPA DEL PREDIO</h2>
        <div class="map-list">
          <p><strong>NORTE</strong><span>320m</span></p>
          <p><strong>SUR</strong><span>510m</span></p>
          <p><strong>MONTAÑA</strong><span>680m</span></p>
          <p><strong>HANGAR</strong><span>420m</span></p>
        </div>
      `;

  backdrop.hidden = false;
  sheet.hidden = false;
  requestAnimationFrame(() => {
    sheet.dataset.open = 'true';
    backdrop.dataset.open = 'true';
  });
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
