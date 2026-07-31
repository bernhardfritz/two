import type { Context } from './bootstrap.ts';
import type { AugmentedWebGL2RenderingContext } from './renderer.ts';
import MyWorker from './worker.ts?worker&inline';

function withMiddleware<T, U>(middleware: (t: T, next: (u: U) => void) => void): (next: (u: U) => void) => (t: T) => void {
  return (next) => {
    return (t) => {      
      middleware(t, next);
    }
  }
}

export function flatland(canvas: HTMLCanvasElement, wasm: Promise<WebAssembly.Module>, options?: WebGLContextAttributes) {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  const fontCanvas = document.createElement('canvas');
  
  const createMouseDownHandler = withMiddleware<MouseEvent, { clientX: number, clientY: number, buttons: number }>((ev, next) => {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    next({ clientX: ev.clientX - rect.left, clientY: ev.clientY - rect.top, buttons: ev.buttons });
  });
  const createMouseMoveHandler = withMiddleware<MouseEvent, { clientX: number, clientY: number }>((ev, next) => {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    next({ clientX: ev.clientX - rect.left, clientY: ev.clientY - rect.top });
  });
  const createMouseUpHandler = withMiddleware<MouseEvent, { clientX: number, clientY: number, buttons: number }>((ev, next) => {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    next({ clientX: ev.clientX - rect.left, clientY: ev.clientY - rect.top, buttons: ev.buttons });
  });
  const createTouchStartHandler = withMiddleware<TouchEvent, { clientX: number, clientY: number, buttons: number }>((ev, next) => {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    next({ clientX: ev.changedTouches[0].clientX - rect.left, clientY: ev.changedTouches[0].clientY - rect.top, buttons: 1 });
  });
  const createTouchMoveHandler = withMiddleware<TouchEvent, { clientX: number, clientY: number }>((ev, next) => {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    next({ clientX: ev.changedTouches[0].clientX - rect.left, clientY: ev.changedTouches[0].clientY - rect.top });
  });
  const createTouchEndHandler = withMiddleware<TouchEvent, { clientX: number, clientY: number, buttons: number }>((ev, next) => {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    next({ clientX: ev.changedTouches[0].clientX - rect.left, clientY: ev.changedTouches[0].clientY - rect.top, buttons: 0 });
  });

  if ('OffscreenCanvas' in window && 'Worker' in window && 'ResizeObserver' in window) {
    canvas.addEventListener('mousedown', createMouseDownHandler(({ clientX, clientY, buttons }) => {
      worker.postMessage({ type: 'mousedown', clientX, clientY, buttons });
    }));
    canvas.addEventListener('mousemove', createMouseMoveHandler(({ clientX, clientY }) => {
      worker.postMessage({ type: 'mousemove', clientX, clientY });
    }));
    canvas.addEventListener('mouseup', createMouseUpHandler(({ clientX, clientY, buttons }) => {
      worker.postMessage({ type: 'mouseup', clientX, clientY, buttons });
    }));
    canvas.addEventListener('touchstart', createTouchStartHandler(({ clientX, clientY, buttons }) => {
      worker.postMessage({ type: 'mousedown', clientX, clientY, buttons });
    }));
    canvas.addEventListener('touchmove', createTouchMoveHandler(({ clientX, clientY }) => {
      worker.postMessage({ type: 'mousemove', clientX, clientY });
    }));
    canvas.addEventListener('touchend', createTouchEndHandler(({ clientX, clientY, buttons }) => {
      worker.postMessage({ type:'mouseup', clientX, clientY, buttons });
    }));
    const worker = new MyWorker();
    worker.postMessage({ type: 'baseURI', baseURI: document.baseURI });
    wasm.then((moduleObject) => {
      const offscreenCanvas = canvas.transferControlToOffscreen();
      const offscreenFontCanvas = fontCanvas.transferControlToOffscreen();
      worker.postMessage({ type: 'canvas', canvas: offscreenCanvas, options, fontCanvas: offscreenFontCanvas, moduleObject }, [offscreenCanvas, offscreenFontCanvas]);
      const observer = new ResizeObserver(() => {
        worker.postMessage({ type: 'resize', clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight, devicePixelRatio: window.devicePixelRatio });
      });
      observer.observe(canvas);
    });
  } else {
    const context: Context = {
      gl: canvas.getContext('webgl2', {
        alpha: false,
        depth: false,
        ...options,
      })! as AugmentedWebGL2RenderingContext,
      fontCanvas,
      baseURI: document.baseURI,
      mouseX: 0,
      mouseY: 0,
      mouseButtons: 0,
    };
    canvas.addEventListener('mousedown', createMouseDownHandler(({ clientX, clientY, buttons }) => {
      Object.assign(context, { mouseX: clientX, mouseY: clientY, mouseButtons: buttons });
    }));
    canvas.addEventListener('mousemove', createMouseMoveHandler(({ clientX, clientY }) => {
      Object.assign(context, { mouseX: clientX, mouseY: clientY });
    }));
    canvas.addEventListener('mouseup', createMouseUpHandler(({ clientX, clientY, buttons }) => {
      Object.assign(context, { mouseX: clientX, mouseY: clientY, mouseButtons: buttons });
    }));
    canvas.addEventListener('touchstart', createTouchStartHandler(({ clientX, clientY, buttons }) => {
      Object.assign(context, { mouseX: clientX, mouseY: clientY, mouseButtons: buttons });
    }));
    canvas.addEventListener('touchmove', createTouchMoveHandler(({ clientX, clientY }) => {
      Object.assign(context, { mouseX: clientX, mouseY: clientY });
    }));
    canvas.addEventListener('touchend', createTouchEndHandler(({ clientX, clientY, buttons }) => {
      Object.assign(context, { mouseX: clientX, mouseY: clientY, mouseButtons: buttons });
    }));
    Promise.all([import('./bootstrap.ts'), wasm]).then(([{ bootstrap }, moduleObject]) => {
      bootstrap(context, moduleObject);
    });
  }
}