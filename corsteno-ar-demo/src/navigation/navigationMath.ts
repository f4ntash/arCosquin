import type { GeoPoint } from './navigationTypes';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

export const normalizeAngle = (degrees: number): number => {
  return ((degrees % 360) + 360) % 360;
};

export const normalizeSignedAngle = (degrees: number): number => {
  return ((degrees + 540) % 360) - 180;
};

export const calculateShortestAngleDelta = (from: number, to: number): number => {
  return normalizeSignedAngle(to - from);
};

export const calculateDistance = (from: GeoPoint, to: GeoPoint): number => {
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const calculateBearing = (from: GeoPoint, to: GeoPoint): number => {
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLongitude) * Math.cos(toLatitude);
  const x =
    Math.cos(fromLatitude) * Math.sin(toLatitude) -
    Math.sin(fromLatitude) * Math.cos(toLatitude) * Math.cos(deltaLongitude);

  return normalizeAngle(toDegrees(Math.atan2(y, x)));
};

export const calculateRelativeBearing = (destinationBearing: number, heading: number): number => {
  return normalizeSignedAngle(destinationBearing - heading);
};

export const smoothHeading = (previous: number | null, next: number, smoothing = 0.18): number => {
  if (previous === null) return normalizeAngle(next);

  const delta = normalizeSignedAngle(next - previous);
  return normalizeAngle(previous + delta * smoothing);
};

export const formatDistance = (meters: number | null): string => {
  if (meters === null) return 'Buscando ubicación...';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

export const getNavigationInstruction = (relativeBearing: number | null): string => {
  if (relativeBearing === null) return 'Buscando orientación...';

  const absoluteBearing = Math.abs(relativeBearing);
  if (absoluteBearing <= 15) return 'SEGUÍ DERECHO';
  if (absoluteBearing >= 150) return 'GIRÁ Y CONTINUÁ EN SENTIDO CONTRARIO';
  return relativeBearing > 0 ? 'GIRÁ HACIA LA DERECHA' : 'GIRÁ HACIA LA IZQUIERDA';
};
