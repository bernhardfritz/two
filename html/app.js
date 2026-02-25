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
  let wasm;
  const efs = {};
  const textures = [];
  const promises = [];
  // This part goes after "const go = new Go();" declaration.
  go.importObject.env = {
    'add': function(x, y) {
      return x + y
    },
    'writeFile': function(targetPathPtr, targetPathLen, goBytesPtr, goBytesLen) {
      const mem = new Uint8Array(wasm.exports.memory.buffer);
      const targetPath = new TextDecoder().decode(mem.subarray(targetPathPtr, targetPathPtr + targetPathLen));
      const goBytes = mem.subarray(goBytesPtr, goBytesPtr + goBytesLen);
      efs[targetPath] = goBytes;
      console.log('writeFile', targetPath, goBytes);
    },
    'loadTexture': function(fileNamePtr, fileNameLen, bytesPtr, bytesLen) {
      const mem = new Uint8Array(wasm.exports.memory.buffer);
      const fileName = new TextDecoder().decode(mem.subarray(fileNamePtr, fileNamePtr + fileNameLen));
      const data = efs[fileName];
      const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const width = dataView.getUint32(16); // PNG
      const height = dataView.getUint32(20);
      const id = textures.length;
      const texture = gl.createTexture();
      const blob = new Blob([data], { type: 'image/png' });
      const promise = createImageBitmap(blob).then((bitmap) => {
        gl.activeTexture(gl.TEXTURE0 + id)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
        bitmap.close();
      }); // not ideal because texture is loaded asynchronously. as long as textures are loaded in main it would be possible to store promises and wait until all promises are resolved before starting the requestAnimationFrame loop
      promises.push(promise);
      const bytes = mem.subarray(bytesPtr, bytesPtr + bytesLen)
      const bytesView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      bytesView.setUint32(0, id, true);
      bytesView.setUint32(4, width, true);
      bytesView.setUint32(8, height, true);
      textures.push(texture);
      // TODO this function should rather store textures in a TEXTURE_2D_ARRAY to allow for even more textures to be loaded
    }
    // ... other functions
  };
  
  WebAssembly.instantiateStreaming(fetch('wasm.wasm'), go.importObject).then(async function (obj) {
    wasm = obj.instance;
    go.run(wasm);
    await Promise.all(promises);
 
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