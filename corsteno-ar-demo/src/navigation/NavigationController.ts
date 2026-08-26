import { DEBUG_NAVIGATION, DEMO_NAVIGATION, DESTINATION } from '../config/navigation';
import {
  calculateBearing,
  calculateDistance,
  calculateRelativeBearing,
  getNavigationInstruction,
  smoothHeading,
} from './navigationMath';
import type {
  DeviceOrientationEventConstructorWithPermission,
  DeviceOrientationEventWithCompass,
  NavigationCallbacks,
  NavigationPosition,
  NavigationState,
} from './navigationTypes';

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 1000,
  timeout: 10000,
};

export class NavigationController {
  private readonly callbacks: NavigationCallbacks;
  private watchId: number | null = null;
  private position: NavigationPosition | null = null;
  private heading: number | null = null;
  private isRunning = false;

  constructor(callbacks: NavigationCallbacks) {
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    await this.requestOrientationPermission();
    this.listenToOrientation();
    this.startWatchingPosition();
    this.emitUpdate('Solicitando ubicación...');
  }

  stop(): void {
    this.isRunning = false;

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.position = null;
    this.heading = null;
  }

  private async requestOrientationPermission(): Promise<void> {
    const OrientationEvent =
      window.DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission | undefined;

    if (!OrientationEvent?.requestPermission) return;

    try {
      const permission = await OrientationEvent.requestPermission();
      if (DEBUG_NAVIGATION) console.debug('[NAV] orientation permission', permission);
      if (permission !== 'granted') {
        this.callbacks.onError('Necesitamos acceso a orientación para mostrar la dirección.');
      }
    } catch {
      this.callbacks.onError('Necesitamos acceso a orientación para mostrar la dirección.');
    }
  }

  private listenToOrientation(): void {
    window.addEventListener('deviceorientation', this.handleOrientation, true);
  }

  private startWatchingPosition(): void {
    if (!navigator.geolocation) {
      this.callbacks.onError('Necesitamos tu ubicación para indicarte cómo llegar.');
      this.emitUpdate('');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (DEBUG_NAVIGATION) console.debug('[NAV] position', position.coords);
        this.position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        this.emitUpdate('');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.callbacks.onError('Necesitamos tu ubicación para indicarte cómo llegar.');
        } else {
          this.emitUpdate('Buscando ubicación...');
        }
      },
      GEOLOCATION_OPTIONS,
    );
    if (DEBUG_NAVIGATION) console.debug('[NAV] geolocation started');
  }

  private readonly handleOrientation = (event: DeviceOrientationEvent): void => {
    const heading = this.extractHeading(event as DeviceOrientationEventWithCompass);
    if (heading === null) return;

    this.heading = smoothHeading(this.heading, heading);
    if (DEBUG_NAVIGATION) console.debug('[NAV] heading', this.heading);
    this.emitUpdate('');
  };

  private extractHeading(event: DeviceOrientationEventWithCompass): number | null {
    if (typeof event.webkitCompassHeading === 'number') {
      return event.webkitCompassHeading;
    }

    if (event.absolute && typeof event.alpha === 'number') {
      return 360 - event.alpha;
    }

    if (typeof event.alpha === 'number') {
      return 360 - event.alpha;
    }

    return null;
  }

  private emitUpdate(statusMessage: string): void {
    const destinationBearing = this.position
      ? calculateBearing(this.position, DESTINATION)
      : DEMO_NAVIGATION.bearingDegrees;
    const distanceMeters = this.position
      ? calculateDistance(this.position, DESTINATION)
      : DEMO_NAVIGATION.distanceMeters;
    const relativeBearing =
      destinationBearing !== null && this.heading !== null
        ? calculateRelativeBearing(destinationBearing, this.heading)
        : DEMO_NAVIGATION.bearingDegrees;

    if (DEBUG_NAVIGATION) {
      console.debug('[NAV] destination bearing', destinationBearing);
      console.debug('[NAV] relative bearing', relativeBearing);
    }

    const state: NavigationState = {
      destinationName: DESTINATION.name,
      position: this.position,
      heading: this.heading,
      destinationBearing,
      relativeBearing,
      distanceMeters,
      instruction: getNavigationInstruction(relativeBearing),
      statusMessage,
    };

    this.callbacks.onUpdate(state);
  }
}
