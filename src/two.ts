import type { Context } from './game.ts';
import type { AugmentedWebGL2RenderingContext } from './renderer.ts';
import MyWorker from './worker.ts?worker&inline';

export function two(canvas: HTMLCanvasElement) {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  if ('OffscreenCanvas' in window && 'Worker' in window && 'ResizeObserver' in window) {
    canvas.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'mousedown', clientX: ev.clientX - rect.left, clientY: ev.clientY - rect.top, buttons: ev.buttons });
    });
    canvas.addEventListener('mousemove', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'mousemove', clientX: ev.clientX - rect.left, clientY: ev.clientY - rect.top });
    });
    canvas.addEventListener('mouseup', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'mouseup', clientX: ev.clientX - rect.left, clientY: ev.clientY - rect.top, buttons: ev.buttons });
    });
    canvas.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'mousedown', clientX: ev.changedTouches[0].clientX - rect.left, clientY: ev.changedTouches[0].clientY - rect.top, buttons: 1 });
    });
    canvas.addEventListener('touchmove', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'mousemove', clientX: ev.changedTouches[0].clientX - rect.left, clientY: ev.changedTouches[0].clientY - rect.top });
    });
    canvas.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({ type: 'mouseup', clientX: ev.changedTouches[0].clientX - rect.left, clientY: ev.changedTouches[0].clientY - rect.top, buttons: 0 });
    });
    const offscreenCanvas = canvas.transferControlToOffscreen();
    const worker = new MyWorker();
    worker.postMessage({ type: 'baseURI', baseURI: document.baseURI });
    worker.postMessage({ type: 'canvas', canvas: offscreenCanvas }, [offscreenCanvas]);
    const observer = new ResizeObserver(() => {
      worker.postMessage({ type: 'resize', clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight, devicePixelRatio: window.devicePixelRatio });
    });
    observer.observe(canvas);
  } else {
    const ctx: Context = {
      gl: canvas.getContext('webgl2')! as AugmentedWebGL2RenderingContext,
      baseURI: document.baseURI,
      mouseX: 0,
      mouseY: 0,
      mouseButtons: 0,
    };
    canvas.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      ctx.mouseX = ev.clientX - rect.left;
      ctx.mouseY = ev.clientY - rect.top;
      ctx.mouseButtons = ev.buttons;
    });
    canvas.addEventListener('mousemove', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      ctx.mouseX = ev.clientX - rect.left;
      ctx.mouseY = ev.clientY - rect.top;
    });
    canvas.addEventListener('mouseup', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      ctx.mouseX = ev.clientX - rect.left;
      ctx.mouseY = ev.clientY - rect.top;
      ctx.mouseButtons = ev.buttons;
    });
    canvas.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      ctx.mouseX = ev.changedTouches[0].clientX - rect.left;
      ctx.mouseY = ev.changedTouches[0].clientY - rect.top;
      ctx.mouseButtons = 1;
    });
    canvas.addEventListener('touchmove', (ev) => {
      ev.preventDefault();      
      const rect = canvas.getBoundingClientRect();
      ctx.mouseX = ev.changedTouches[0].clientX - rect.left;
      ctx.mouseY = ev.changedTouches[0].clientY - rect.top;
    });
    canvas.addEventListener('touchend', (ev) => {
      ev.preventDefault();      
      const rect = canvas.getBoundingClientRect();
      ctx.mouseX = ev.changedTouches[0].clientX - rect.left;
      ctx.mouseY = ev.changedTouches[0].clientY - rect.top;
      ctx.mouseButtons = 0;
    });
    import('./game.ts').then(({ game }) => {
      game(ctx);
    });
  }
}