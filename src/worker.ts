import { game, type Context } from './game.ts';

const ctx = {} as Context;

onmessage = (evt) => {
  switch (evt.data.type) {
    case 'baseURI':
      ctx.baseURI = evt.data.baseURI;
      break;
    case 'canvas':
      Object.assign(ctx, {
        gl: evt.data.canvas.getContext('webgl2', { alpha: false })!,
        mouseX: 0,        
        mouseY: 0,
        mouseButtons: 0,
      })
      game(ctx);
      break;
    case 'resize':
      ctx.gl.canvas.clientWidth = evt.data.clientWidth;
      ctx.gl.canvas.clientHeight = evt.data.clientHeight;
      globalThis.devicePixelRatio = evt.data.devicePixelRatio;
      break;
    case 'mousemove':
      ctx.mouseX = evt.data.clientX;
      ctx.mouseY = evt.data.clientY;
      break;
    case 'mousedown':
      ctx.mouseButtons = evt.data.buttons;
      break;
    case 'mouseup':
      ctx.mouseButtons = evt.data.buttons;
      break;
  }
}