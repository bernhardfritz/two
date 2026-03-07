importScripts('wasm_exec.js');
importScripts('app.js');
importScripts('renderer.js');

var gl;
var window = {};

onmessage = (evt) => {
  switch (evt.data.type) {
    case 'canvas':
      gl = app(evt.data.canvas, renderer);
      break;
    case 'resize':
      gl.canvas.clientWidth = evt.data.clientWidth;
      gl.canvas.clientHeight = evt.data.clientHeight;
      window.devicePixelRatio = evt.data.devicePixelRatio;
      break;
  }
}
