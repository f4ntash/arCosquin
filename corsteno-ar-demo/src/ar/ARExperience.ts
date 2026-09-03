import type { MindARThree as MindARThreeInstance } from 'mind-ar/dist/mindar-image-three.prod.js';

export type ARExperienceCallbacks = {
  onReady: () => void;
  onTargetFound: () => void;
  onTargetLost: () => void;
  onError: (message: string) => void;
};

const TARGET_SRC = '/targets/cosquin-rock.mind';
const TARGET_MISSING_MESSAGE =
  'Target AR no encontrado.\nAgregá public/targets/cosquin-rock.mind para probar el tracking.';
const MINDAR_START_TIMEOUT_MS = 12_000;

export class ARExperience {
  private readonly container: HTMLElement;
  private readonly callbacks: ARExperienceCallbacks;
  private mindAR: MindARThreeInstance | null = null;
  private animationFrame = 0;
  private isRunning = false;
  private hasShownIntro = false;
  private targetDetected = false;
  // Arexperience is a singleton, so we can use a static instance to ensure only one instance is running at a time.
  constructor(container: HTMLElement, callbacks: ARExperienceCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[AR] start requested');

    try {
      await this.verifyTarget();
      console.log('[AR] target verified');
      console.log('[AR] importing MindAR');
      const { MindARThree } = await import('mind-ar/dist/mindar-image-three.prod.js');
      console.log('[AR] MindAR imported');

      console.log('[AR] creating MindARThree');
      this.mindAR = new MindARThree({
        container: this.container,
        imageTargetSrc: TARGET_SRC,
        maxTrack: 1,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        filterMinCF: 0.0001,
        filterBeta: 0.001,
        warmupTolerance: 5,
        missTolerance: 5,
      });

      const anchor = this.mindAR.addAnchor(0);
      anchor.onTargetFound = () => this.handleTargetFound();
      anchor.onTargetLost = () => this.handleTargetLost();
      console.log('[AR] anchor created');

      console.log('[AR] calling mindAR.start()');
      await this.withTimeout(this.mindAR.start(), MINDAR_START_TIMEOUT_MS);
      console.log('[AR] mindAR.start() resolved');

      this.mindAR.renderer.setClearColor(0x000000, 0);
      await this.waitForNextFrame();
      this.normalizeCameraLayers();
      this.callbacks.onReady();
      console.log('[AR] starting render loop');
      this.render();
    } catch (error) {
      console.error('[AR] startup error', error);
      this.isRunning = false;
      this.stop();
      this.callbacks.onError(this.normalizeError(error));
    }
  }

  stop(): void {
    this.isRunning = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }

    if (this.mindAR) {
      try {
        this.mindAR.stop();
      } catch {
        this.stopRemainingMediaTracks();
      }

      this.mindAR.renderer.dispose();
      this.mindAR = null;
    } else {
      this.stopRemainingMediaTracks();
    }

    this.hasShownIntro = false;
    this.targetDetected = false;
    this.container.replaceChildren();
  }

  private async verifyTarget(): Promise<void> {
    const response = await fetch(TARGET_SRC, {
      cache: 'no-store',
    });

    console.log('[AR] target response', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });

    if (!response.ok) {
      throw new Error(TARGET_MISSING_MESSAGE);
    }
  }

  private handleTargetFound(): void {
    if (this.targetDetected) return;
    this.targetDetected = true;
    if (!this.hasShownIntro) {
      this.hasShownIntro = true;
    }

    this.callbacks.onTargetFound();
  }

  private handleTargetLost(): void {
    if (!this.targetDetected) return;
    this.targetDetected = false;
    this.callbacks.onTargetLost();
  }

  private render = (): void => {
    if (!this.isRunning || !this.mindAR) return;

    this.animationFrame = requestAnimationFrame(this.render);
    this.mindAR.renderer.render(this.mindAR.scene, this.mindAR.camera);
  };

  private normalizeCameraLayers(): void {
    if (!this.mindAR) return;

    const video = this.container.querySelector('video');
    if (video) {
      video.style.position = 'absolute';
      video.style.inset = '0';
      video.style.zIndex = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.pointerEvents = 'none';
      video.style.background = 'transparent';
    }

    this.mindAR.renderer.domElement.style.zIndex = '1';
    this.mindAR.renderer.domElement.style.pointerEvents = 'none';
    this.mindAR.renderer.domElement.style.background = 'transparent';
    this.mindAR.cssRenderer.domElement.style.zIndex = '1';
    this.mindAR.cssRenderer.domElement.style.pointerEvents = 'none';
    this.mindAR.cssRenderer.domElement.style.background = 'transparent';
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId = 0;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(`MindAR start timeout after ${timeoutMs / 1000} seconds`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private waitForNextFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  private normalizeError(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.stack ?? error.message;
    }

    return 'No se pudo iniciar la experiencia AR. Revisá permisos de cámara y compatibilidad del navegador.';
  }

  private stopRemainingMediaTracks(): void {
    this.container.querySelectorAll('video').forEach((video) => {
      const stream = video.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
  }
}
