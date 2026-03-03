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
  let bitmapPromises = [];
  let maxBitmapWidth = 0;
  let maxBitmapHeight = 0;
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
    'loadImage': function(fileNamePtr, fileNameLen, bytesPtr, bytesLen) {
      const mem = new Uint8Array(wasm.exports.memory.buffer);
      const fileName = new TextDecoder().decode(mem.subarray(fileNamePtr, fileNamePtr + fileNameLen));
      const data = efs[fileName];
      const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const width = dataView.getUint32(16); // PNG
      const height = dataView.getUint32(20);
      const id = bitmapPromises.length;
      const blob = new Blob([data], { type: 'image/png' });
      const bitmap = createImageBitmap(blob);
      bitmapPromises.push(bitmap);
      maxBitmapWidth = Math.max(maxBitmapWidth, width);
      maxBitmapHeight = Math.max(maxBitmapHeight, height);
      const bytes = mem.subarray(bytesPtr, bytesPtr + bytesLen)
      const bytesView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      bytesView.setUint32(0, id, true);
      bytesView.setUint32(4, width, true);
      bytesView.setUint32(8, height, true);
    }
    // ... other functions
  };
  
  WebAssembly.instantiateStreaming(fetch('wasm.wasm'), go.importObject).then(async function (obj) {
    wasm = obj.instance;
    go.run(wasm);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // TODO when loading textures, the clamping setting could also be relevant. see https://github.com/gfxfundamentals/webgl-fundamentals/discussions/396
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, maxBitmapWidth, maxBitmapHeight, bitmapPromises.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    bitmapPromises = bitmapPromises.map((bitmapPromise, index) => bitmapPromise.then((bitmap) => {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, bitmap.width, bitmap.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
      bitmap.close();
    }));
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    await Promise.all(bitmapPromises);

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