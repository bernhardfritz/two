import { renderer, sizeof, sizes, type AugmentedWebGL2RenderingContext } from './renderer.ts';

const DEFAULT_FONT_SIZE = 32;
const DEFAULT_FONT = `${DEFAULT_FONT_SIZE}px monospace`;

const init: typeof WebAssembly.instantiateStreaming = WebAssembly.instantiateStreaming || (async (resp, importObject) => {
  const source = await (await resp).arrayBuffer();
  return await WebAssembly.instantiate(source, importObject);
});

export interface Context {
  gl: AugmentedWebGL2RenderingContext;
  fontCanvas: HTMLCanvasElement | OffscreenCanvas;
  baseURI: string;
  mouseX: number;
  mouseY: number;
  mouseButtons: number;
}

export async function game(context: Context) {
  const gl = context.gl;
  await import(new URL(`${context.baseURI}wasm_exec.js`).href);
  //@ts-ignore
  const go = new Go(); // Defined in // Providing the environment object, used in WebAssembly.instantiateStreaming.
  let wasm: WebAssembly.Instance;
  const efs: Record<string, Uint8Array<ArrayBuffer>> = {};
  let bitmapPromises: Promise<ImageBitmap>[] = [createImageBitmap(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1))];
  let maxBitmapWidth = 1;
  let maxBitmapHeight = 1;
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
      const id = bitmapPromises.length - 1; // subtract 1 because first bitmap is 1x1 white pixel
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
    },
    'loadFont': function(fontPtr: number, fontLen: number, bytesPtr: number, bytesLen: number) {
      const mem = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer);
      let font = new TextDecoder().decode(mem.subarray(fontPtr, fontPtr + fontLen));
      let fontSize;
      const regexMatch = font.match(/(\d+)px (.+)/);
        if (regexMatch) {
          fontSize = +regexMatch[1]; 
        } else {
          font = DEFAULT_FONT;
          fontSize = DEFAULT_FONT_SIZE;
        }
      const ctx = context.fontCanvas.getContext('2d')!;
      ctx.font = font;
      const monospaceWidth = ctx.measureText('a').width;
      const rows = 6;
      const columns = 16;
      const gap = 1;
      context.fontCanvas.width = Math.ceil(gap + (monospaceWidth + gap) * columns);
      context.fontCanvas.height = Math.ceil(gap + (fontSize + gap) * rows);
      ctx.reset();
      ctx.font = font;
      ctx.fillStyle = 'white';
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          ctx.fillText(String.fromCharCode(32 + row * columns + col), gap + col * (ctx.measureText('a').width + gap), gap + fontSize + row * (gap + fontSize) - ctx.measureText(String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i))).actualBoundingBoxDescent + 1);
        }
      }
      const id = bitmapPromises.length - 1; // subtract 1 because first bitmap is 1x1 white pixel
      const bitmap = createImageBitmap(context.fontCanvas);
      bitmapPromises.push(bitmap);
      maxBitmapWidth = Math.max(maxBitmapWidth, context.fontCanvas.width);
      maxBitmapHeight = Math.max(maxBitmapHeight, context.fontCanvas.height);
      const bytes = mem.subarray(bytesPtr, bytesPtr + bytesLen)
      const bytesView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      bytesView.setUint32(0, id, true);
      bytesView.setUint32(4, context.fontCanvas.width, true);
      bytesView.setUint32(8, context.fontCanvas.height, true);
    }
    // ... other functions
  };
  
  init(fetch(new URL(`${context.baseURI}main.wasm`)), go.importObject).then(async function (obj) {
    wasm = obj.instance;
    go.run(wasm);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // TODO when loading textures, the clamping setting could also be relevant. see https://github.com/gfxfundamentals/webgl-fundamentals/discussions/396
    // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
      ['a_tint_color', 'vec4'],
    ]);
    const render = renderer(gl, attributes);
    let previousTime = 0;
    const frameRequestCallback: FrameRequestCallback = (time) => {
      const slice = (wasm.exports.update as (deltaTime: number, width: number, height: number, mouseX: number, mouseY: number, mouseButtons: number) => bigint)(time - previousTime, gl.canvas.clientWidth, gl.canvas.clientHeight, context.mouseX, context.mouseY, context.mouseButtons);
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