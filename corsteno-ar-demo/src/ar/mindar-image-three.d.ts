declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import type { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
  import type { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';

  export type MindARAnchor = {
    group: Group;
    targetIndex: number;
    onTargetFound: (() => void) | null;
    onTargetLost: (() => void) | null;
    onTargetUpdate: (() => void) | null;
    visible: boolean;
  };

  export type MindARThreeOptions = {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: 'yes' | 'no';
    uiScanning?: 'yes' | 'no';
    uiError?: 'yes' | 'no';
    filterMinCF?: number | null;
    filterBeta?: number | null;
    warmupTolerance?: number | null;
    missTolerance?: number | null;
    userDeviceId?: string | null;
    environmentDeviceId?: string | null;
  };

  export class MindARThree {
    camera: PerspectiveCamera;
    cssRenderer: CSS3DRenderer;
    renderer: WebGLRenderer;
    scene: Scene;

    constructor(options: MindARThreeOptions);
    addAnchor(targetIndex: number): MindARAnchor;
    start(): Promise<void>;
    stop(): void;
  }
}
