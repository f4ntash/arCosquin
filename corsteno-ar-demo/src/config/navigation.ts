import type { StageId } from '../data/cosquinRock2026';
import type { GeoPoint } from '../navigation/navigationTypes';

export const DEBUG_NAVIGATION = false;

export type StageNavigationConfig = GeoPoint & {
  demoDistanceMeters: number;
  demoBearingDegrees: number;
};

export const DEFAULT_DEMO_STAGE_ID: StageId = 'norte';

// Coordenadas DEMO: no representan ubicaciones reales del predio.
// La estructura queda preparada para reemplazarlas por coordenadas reales por escenario.
export const DEMO_STAGE_LOCATIONS: Record<StageId, StageNavigationConfig> = {
  norte: { latitude: -31.42035, longitude: -64.18878, demoDistanceMeters: 320, demoBearingDegrees: 0 },
  sur: { latitude: -31.42108, longitude: -64.18792, demoDistanceMeters: 510, demoBearingDegrees: 95 },
  montana: { latitude: -31.41952, longitude: -64.18688, demoDistanceMeters: 680, demoBearingDegrees: 42 },
  boomerang: { latitude: -31.42204, longitude: -64.18954, demoDistanceMeters: 420, demoBearingDegrees: 170 },
  paraguay: { latitude: -31.41886, longitude: -64.19012, demoDistanceMeters: 730, demoBearingDegrees: 310 },
  'casita-blues': { latitude: -31.42078, longitude: -64.19074, demoDistanceMeters: 260, demoBearingDegrees: 250 },
  'plaza-electronic': { latitude: -31.41911, longitude: -64.18808, demoDistanceMeters: 560, demoBearingDegrees: 28 },
  sorpresa: { latitude: -31.42162, longitude: -64.18666, demoDistanceMeters: 390, demoBearingDegrees: 128 },
};

export const getStageNavigationConfig = (stageId: StageId): StageNavigationConfig => {
  return DEMO_STAGE_LOCATIONS[stageId] ?? DEMO_STAGE_LOCATIONS[DEFAULT_DEMO_STAGE_ID];
};
