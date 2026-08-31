import { bootstrap, type Context } from './bootstrap.ts';

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
        fontMap: evt.data.fontMap,
        // @ts-ignore: Property 'fonts' does not exist on type 'Window & typeof globalThis'
        fonts: self.fonts,
        mouseX: 0,
        mouseY: 0,
        mouseButtons: 0,
        keys: 0n,
      })
      context.gl.canvas.clientWidth = evt.data.width;
      context.gl.canvas.clientHeight = evt.data.height;
      bootstrap(context, evt.data.moduleObject);
      break;
    case 'resize':
      if (context.gl) {
        context.gl.canvas.clientWidth = evt.data.width;
        context.gl.canvas.clientHeight = evt.data.height;
      }
      globalThis.devicePixelRatio = evt.data.devicePixelRatio;
      break;
    case 'mouse':
      Object.assign(context, evt.data);
      break;
    case 'keyboard':
      Object.assign(context, evt.data);
      break;
  }
}