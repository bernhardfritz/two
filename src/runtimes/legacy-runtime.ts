import type { Context } from '../bootstrap.ts';
import type { FlatlandMouseEventListenerObject } from '../canvas-events/mouse-event.ts';
import type { FlatlandResizeEventListenerObject } from '../canvas-events/resize-event.ts';
import type { AugmentedWebGL2RenderingContext } from '../renderer.ts';

export interface RuntimeWithoutContext extends FlatlandMouseEventListenerObject, FlatlandResizeEventListenerObject {
  run(wasm: Promise<WebAssembly.Module>): void;
}

export interface Runtime extends RuntimeWithoutContext, Context {}

export function createLegacyRuntime(canvas: HTMLCanvasElement, fontCanvas: HTMLCanvasElement, fontMap: Map<string, string>, options?: WebGLContextAttributes): Runtime {
  const runtime: Runtime = {
    gl: canvas.getContext('webgl2', {
      alpha: false,
      depth: false,
      ...options,
    })! as AugmentedWebGL2RenderingContext,
    fontCanvas,
    fontMap,
    fonts: document.fonts,
    baseURI: document.baseURI,
    mouseX: 0,
    mouseY: 0,
    mouseButtons: 0,
    handleMouseEvent: (mouseEvent) => {
      Object.assign(runtime, mouseEvent)
    },
    handleResizeEvent: (_resizeEvent) => {
      // listening to resize events is not really necessary for non-worker runtimes because we can directly read clientWidth and clientHeight from canvas
    },
    run: (wasm) => {
      Promise.all([import('../bootstrap.ts'), wasm]).then(([{ bootstrap }, moduleObject]) => {
        bootstrap(runtime, moduleObject);
      });
    },
  };

  return runtime;
}