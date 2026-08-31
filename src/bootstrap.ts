import { renderer, sizeof, sizes, type AugmentedWebGL2RenderingContext } from './renderer.ts';

const DEFAULT_FONT_SIZE = 32;
const DEFAULT_FONT = `${DEFAULT_FONT_SIZE}px monospace`;

export interface Context {
  gl: AugmentedWebGL2RenderingContext;
  fontCanvas: HTMLCanvasElement | OffscreenCanvas;
  fontMap: Map<string, string>;
  fonts: FontFaceSet;
  baseURI: string;
  mouseX: number;
  mouseY: number;
  mouseButtons: number;
  keys: bigint;
}

interface ImageBitmapItem {
  data: Promise<ImageBitmap>,
  width: number;
  height: number;
}

export async function bootstrap(context: Context, moduleObject: WebAssembly.Module) {
  const gl = context.gl;
  for (const [fontFamily, url] of context.fontMap) {
    const fontFace = new FontFace(fontFamily, `url(${new URL(url, context.baseURI).href})`) ;
    context.fonts.add(fontFace);
    await fontFace.load();
  }
  await import(new URL('wasm_exec.js', context.baseURI).href);
  //@ts-ignore
  const go = new Go(); // Defined in // Providing the environment object, used in WebAssembly.instantiateStreaming.
  let wasm: WebAssembly.Instance;
  const efs: Record<string, Uint8Array<ArrayBuffer>> = {};
  const imageBitmapItems: ImageBitmapItem[] = [];
  const whitePixel: ImageBitmapItem = {
    data: createImageBitmap(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)),
    width: 1,
    height: 1,
  };
  imageBitmapItems.push(whitePixel);
  // This part goes after "const go = new Go();" declaration.
  go.importObject.env = {
    'writeFile': function(targetPathPtr: number, targetPathLen: number, goBytesPtr: number, goBytesLen: number) {
      const mem = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer);
      const targetPath = new TextDecoder().decode(mem.subarray(targetPathPtr, targetPathPtr + targetPathLen));
      const goBytes = mem.subarray(goBytesPtr, goBytesPtr + goBytesLen);
      efs[targetPath] = new Uint8Array(goBytes); // copy is needed because go will garbage collect the shared memory
    },
    'loadTexture': function(fileNamePtr: number, fileNameLen: number, bytesPtr: number, bytesLen: number) {
      const mem = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer);
      const fileName = new TextDecoder().decode(mem.subarray(fileNamePtr, fileNamePtr + fileNameLen));
      const data = efs[fileName];
      const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const blob = new Blob([data], { type: 'image/png' });
      const imageBitmapItem: ImageBitmapItem = {
        data: createImageBitmap(blob),
        width: dataView.getUint32(16), // PNG
        height: dataView.getUint32(20),
      }
      const id = imageBitmapItems.push(imageBitmapItem) - 2; // subtract 2 because first bitmap is 1x1 white pixel
      const bytes = mem.subarray(bytesPtr, bytesPtr + bytesLen)
      const bytesView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      bytesView.setUint32(0, id, true);
      bytesView.setUint32(4, imageBitmapItem.width, true);
      bytesView.setUint32(8, imageBitmapItem.height, true);
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
      const imageBitmapItem: ImageBitmapItem = { 
        data: createImageBitmap(context.fontCanvas),
        width: context.fontCanvas.width,
        height: context.fontCanvas.height,
      }
      const id = imageBitmapItems.push(imageBitmapItem) - 2; // subtract 2 because first bitmap is 1x1 white pixel
      const bytes = mem.subarray(bytesPtr, bytesPtr + bytesLen)
      const bytesView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      bytesView.setUint32(0, id, true);
      bytesView.setUint32(4, imageBitmapItem.width, true);
      bytesView.setUint32(8, imageBitmapItem.height, true);
    }
    // ... other functions
  };
  
  WebAssembly.instantiate(moduleObject, go.importObject).then(async function(instance) {
    wasm = instance;
    go.run(wasm);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // TODO when loading textures, the clamping setting could also be relevant. see https://github.com/gfxfundamentals/webgl-fundamentals/discussions/396
    // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const maxImageBitmapWidth = imageBitmapItems.reduce((acc, imageBitmapItem) => Math.max(acc, imageBitmapItem.width), 0);
    const maxImageBitmapHeight = imageBitmapItems.reduce((acc, imageBitmapItem) => Math.max(acc, imageBitmapItem.height), 0);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, maxImageBitmapWidth, maxImageBitmapHeight, imageBitmapItems.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const promises = imageBitmapItems
      .map((texImageSourceItem, index) => texImageSourceItem.data.then((imageBitmap) => {
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, imageBitmap.width, imageBitmap.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
        imageBitmap.close();
      }));
    await Promise.all(promises);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);

    const attributes = new Map<string, keyof typeof sizes>([
      ['a_model_matrix', 'mat4'],
      ['a_texture_matrix', 'mat4'],
      ['a_tint_color', 'vec4'],
    ]);
    const stride = sizeof(attributes) / Float32Array.BYTES_PER_ELEMENT;
    const render = renderer(gl, attributes);
    let previousTime = 0;
    const frameRequestCallback: FrameRequestCallback = (time) => {
      const slice = (wasm.exports.animationLoop as (deltaTime: number, width: number, height: number, mouseX: number, mouseY: number, mouseButtons: number, keys: bigint) => bigint)(time - previousTime, gl.canvas.clientWidth, gl.canvas.clientHeight, context.mouseX, context.mouseY, context.mouseButtons, context.keys);
      const ptr = Number(slice >> 32n);
      const len = Number(slice & 0xffffffffn);
      const bytes = new Uint8Array((wasm.exports.memory as WebAssembly.Memory).buffer, ptr, len);
      const instances = new Float32Array(bytes.buffer, bytes.byteOffset, len * stride);
      render(instances);
      previousTime = time;
      requestAnimationFrame(frameRequestCallback);
    }
    requestAnimationFrame(frameRequestCallback);
  });
}