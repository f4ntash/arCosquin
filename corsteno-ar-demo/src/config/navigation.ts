export const DEBUG_NAVIGATION = false;

export const USE_DEMO_DESTINATION = true;

export const DEMO_NAVIGATION = {
  distanceMeters: 320,
  bearingDegrees: 0,
};

export const DESTINATION = {
  name: 'ESCENARIO NORTE',
  // Coordenadas de demo: no representan una ubicación real del festival.
  // Cambiá latitude/longitude para probar desde casa.
  // Usá un punto cercano, idealmente entre 50 y 200 metros de tu ubicación real.
  latitude: USE_DEMO_DESTINATION ? -31.42035 : -31.42035,
  longitude: USE_DEMO_DESTINATION ? -64.18878 : -64.18878,
} as const;
