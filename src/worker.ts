import { game } from './game.ts';
import { type AugmentedWebGL2RenderingContext } from './renderer.ts';

let baseURI: string;
let gl: AugmentedWebGL2RenderingContext;

onmessage = (evt) => {
  switch (evt.data.type) {
    case 'baseURI':
      baseURI = evt.data.baseURI;
      break;
    case 'canvas':
      gl = evt.data.canvas.getContext('webgl2', { alpha: false })!;
      game(gl, baseURI);
      break;
    case 'resize':
      gl.canvas.clientWidth = evt.data.clientWidth;
      gl.canvas.clientHeight = evt.data.clientHeight;
      globalThis.devicePixelRatio = evt.data.devicePixelRatio;
      break;
  }
}