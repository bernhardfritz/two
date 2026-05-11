import { game, type Context } from './game.ts';

const context = {} as Context;

onmessage = (evt) => {
  switch (evt.data.type) {
    case 'baseURI':
      context.baseURI = evt.data.baseURI;
      break;
    case 'canvas':
      Object.assign(context, {
        gl: evt.data.canvas.getContext('webgl2', {
          alpha: false,
          depth: false,
          ...evt.data.options
        })!,
        fontCanvas: evt.data.fontCanvas,
        mouseX: 0,        
        mouseY: 0,
        mouseButtons: 0,
      })
      game(context);
      break;
    case 'resize':
      context.gl.canvas.clientWidth = evt.data.clientWidth;
      context.gl.canvas.clientHeight = evt.data.clientHeight;
      globalThis.devicePixelRatio = evt.data.devicePixelRatio;
      break;
    case 'mousedown':
      context.mouseX = evt.data.clientX;
      context.mouseY = evt.data.clientY;
      context.mouseButtons = evt.data.buttons;
      break;
    case 'mousemove':
      context.mouseX = evt.data.clientX;
      context.mouseY = evt.data.clientY;
      break;
    case 'mouseup':
      context.mouseX = evt.data.clientX;
      context.mouseY = evt.data.clientY;
      context.mouseButtons = evt.data.buttons;
      break;
  }
}