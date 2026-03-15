import { renderer, sizeof, sizes, type AugmentedWebGL2RenderingContext } from './renderer.ts';

const init: typeof WebAssembly.instantiateStreaming = WebAssembly.instantiateStreaming || (async (resp, importObject) => {
  const source = await (await resp).arrayBuffer();
  return await WebAssembly.instantiate(source, importObject);
});

export interface Context {
  gl: AugmentedWebGL2RenderingContext;
  baseURI: string;
  mouseX: number;
  mouseY: number;
  mouseButtons: number;
}

export async function game(ctx: Context) {
  const gl = ctx.gl;
  await import(new URL(`${import.meta.env.BASE_URL}wasm_exec.js`, ctx.baseURI).href);
  //@ts-ignore
  const go = new Go(); // Defined in // Providing the environment object, used in WebAssembly.instantiateStreaming.
  let wasm: WebAssembly.Instance;
  const efs: Record<string, Uint8Array<ArrayBuffer>> = {};
  let bitmapPromises: Promise<ImageBitmap>[] = [];
  let maxBitmapWidth = 0;
  let maxBitmapHeight = 0;
  // This part goes after "const go = new Go();" declaration.
  go.importObject.env = {
    'writeFile': function(targetPathPtr: number, targetPathLen: number, goBytesPtr: number, goBytesLen: number) {
      const mem = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer);
      const targetPath = new TextDecoder().decode(mem.subarray(targetPathPtr, targetPathPtr + targetPathLen));
      const goBytes = mem.subarray(goBytesPtr, goBytesPtr + goBytesLen);
      efs[targetPath] = goBytes;
    },
    'loadTexture': function(fileNamePtr: number, fileNameLen: number, bytesPtr: number, bytesLen: number) {
      const mem = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer);
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
  
  init(fetch(new URL(`${import.meta.env.BASE_URL}main.wasm`, ctx.baseURI)), go.importObject).then(async function (obj) {
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

      return bitmap;
    }));
    await Promise.all(bitmapPromises);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);

    const attributes = new Map<string, keyof typeof sizes>([
      ['a_model_matrix', 'mat4'],
      ['a_texture_matrix', 'mat4'],
      ['a_color', 'vec4'],
    ]);
    const render = renderer(gl, attributes);
    let previousTime = 0;
    const frameRequestCallback: FrameRequestCallback = (time) => {
      const slice = (wasm.exports.update as (deltaTime: number, width: number, height: number, mouseX: number, mouseY: number, mouseButtons: number) => bigint)(time - previousTime, gl.canvas.clientWidth, gl.canvas.clientHeight, ctx.mouseX, ctx.mouseY, ctx.mouseButtons);
      const ptr = Number(slice >> 32n);
      const len = Number(slice & 0xffffffffn);
      const bytes = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer, ptr, len);
      const instances = new Float32Array(bytes.buffer, bytes.byteOffset, (sizeof(attributes) / 4) * len);
      render(instances);
      previousTime = time;
      requestAnimationFrame(frameRequestCallback);
    }
    requestAnimationFrame(frameRequestCallback);
  });
}