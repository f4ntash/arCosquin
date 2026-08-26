export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type NavigationPosition = GeoPoint & {
  accuracy: number;
};

export type NavigationState = {
  destinationName: string;
  position: NavigationPosition | null;
  heading: number | null;
  destinationBearing: number | null;
  relativeBearing: number | null;
  distanceMeters: number | null;
  instruction: string;
  statusMessage: string;
};

export type NavigationCallbacks = {
  onUpdate: (state: NavigationState) => void;
  onError: (message: string) => void;
};

export type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export type DeviceOrientationPermissionState = 'granted' | 'denied' | 'default';

export type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<DeviceOrientationPermissionState>;
};
