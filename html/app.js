if (!WebAssembly.instantiateStreaming) { // polyfill
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

function app(canvas, renderer) {
  var gl = canvas.getContext("webgl2", { alpha: false });
  if (!gl) {
    return;
  }

  const go = new Go(); // Defined in // Providing the environment object, used in WebAssembly.instantiateStreaming.
  // This part goes after "const go = new Go();" declaration.
  go.importObject.env = {
    'add': function(x, y) {
      return x + y
    }
    // ... other functions
  };
  
  WebAssembly.instantiateStreaming(fetch('wasm.wasm'), go.importObject).then(function (obj) {
    const wasm = obj.instance;
    go.run(wasm);
 
    const render = renderer(gl);
    let previousTime = 0;
    const frameRequestCallback = (time) => {
      const slice = wasm.exports.update(time - previousTime);
      const ptr = Number(slice >> 32n);
      const len = Number(slice & 0xffffffffn);
      const instances = new Uint8Array(wasm.exports.memory.buffer, ptr, len);
      render(instances);
      previousTime = time;
      requestAnimationFrame(frameRequestCallback);
    }
    requestAnimationFrame(frameRequestCallback);
  });
  
  return gl;
}