import MyWorker from '../worker.ts?worker&inline';
import type { RuntimeWithoutContext } from './legacy-runtime';

export function createWorkerRuntime(canvas: HTMLCanvasElement, fontCanvas: HTMLCanvasElement, fontMap: Map<string, string>, options?: WebGLContextAttributes): RuntimeWithoutContext {
  const worker = new MyWorker();
  const runtime: RuntimeWithoutContext = {
    handleMouseEvent: (mouseEvent) => {
      worker.postMessage({ type: 'mouse', ...mouseEvent });
    },
    handleKeyboardEvent: (keyboardEvent) => {
      worker.postMessage({ type: 'keyboard', ...keyboardEvent })
    },
    handleResizeEvent: (resizeEvent) => {
      worker.postMessage({ type: 'resize', ...resizeEvent });
    },
    run: (wasm) => {
      worker.postMessage({ type: 'baseURI', baseURI: document.baseURI });
      wasm.then((moduleObject) => {
        const offscreenCanvas = canvas.transferControlToOffscreen();
        const offscreenFontCanvas = fontCanvas.transferControlToOffscreen();
        worker.postMessage({ type: 'canvas', canvas: offscreenCanvas, width: canvas.clientWidth, height: canvas.clientHeight, options, fontCanvas: offscreenFontCanvas, fontMap, moduleObject }, [offscreenCanvas, offscreenFontCanvas]);
      });
    }
  } 
  
  return runtime;
}