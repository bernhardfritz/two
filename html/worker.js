importScripts('wasm_exec.js');
importScripts('https://webgl2fundamentals.org/webgl/resources/webgl-utils.js');
importScripts('https://webgl2fundamentals.org/webgl/resources/m4.js');
importScripts('app.js');
importScripts('renderer.js');

var gl;

onmessage = (evt) => {
  switch (evt.data.type) {
    case 'canvas':
      gl = app(evt.data.canvas, renderer);
      break;
    case 'resize':
      gl.canvas.clientWidth = evt.data.clientWidth;
      gl.canvas.clientHeight = evt.data.clientHeight;
      break;
  }
}
