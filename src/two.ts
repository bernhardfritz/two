import type { AugmentedWebGL2RenderingContext } from './renderer.ts';
import MyWorker from './worker.ts?worker&inline';

export function two(canvas: HTMLCanvasElement) {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  if ('OffscreenCanvas' in window && 'Worker' in window && 'ResizeObserver' in window) {
    const offscreenCanvas = canvas.transferControlToOffscreen();
    const worker = new MyWorker();
    worker.postMessage({ type: 'baseURI', baseURI: document.baseURI });
    worker.postMessage({ type: 'canvas', canvas: offscreenCanvas }, [offscreenCanvas]);
    const observer = new ResizeObserver(() => {
      worker.postMessage({ type: 'resize', clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight, devicePixelRatio: window.devicePixelRatio });
    });
    observer.observe(canvas);
  } else {
    import('./game.ts').then(({ game }) => {
      game(canvas.getContext('webgl2')! as AugmentedWebGL2RenderingContext, document.baseURI);
    });
  }
}
