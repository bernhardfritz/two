import { registerCanvasKeyboardEventListener, registerCanvasMouseEventListener, registerCanvasResizeEventListener, registerCanvasTouchEventListener } from './canvas-events';
import { createLegacyRuntime, createWorkerRuntime, type RuntimeWithoutContext } from './runtimes';

export function flatland(canvas: HTMLCanvasElement, wasm: Promise<WebAssembly.Module>, options?: WebGLContextAttributes) {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.tabIndex = 0;
  const fontCanvas = document.createElement('canvas');
  const fontMap = new Map<string, string>();
  for (const styleSheet of document.styleSheets) {
    try { // Accessing styleSheet.cssRules on a stylesheet hosted on a different domain will throw a SecurityError
      for (const cssRule of styleSheet.cssRules) {
        if (cssRule.constructor.name === 'CSSFontFaceRule') {
          const cssText = cssRule.cssText;
          const fontFamilyMatch = cssText.match(/font-family\s*:\s*['"]?([^'";}]+)['"]?/i);
          const urlMatch = cssText.match(/url\(\s*['"]?([^'")]*)['"]?\s*\)/i);
          if (fontFamilyMatch && urlMatch) {
            const fontFamily = fontFamilyMatch[1].trim();
            const url = urlMatch[1].trim();
            fontMap.set(fontFamily, url);
          }
        }
      }
    } catch (e) {
      console.warn(`Skipped parsing CSSFontFaceRule for stylesheet: ${styleSheet.href}`);
    }
  }
  
  const runtime: RuntimeWithoutContext = 'Worker' in window && 'OffscreenCanvas' in window
    ? createWorkerRuntime(canvas, fontCanvas, fontMap, options)
    : createLegacyRuntime(canvas, fontCanvas, fontMap, options);
  registerCanvasMouseEventListener(canvas, runtime);
  registerCanvasTouchEventListener(canvas, runtime);
  registerCanvasKeyboardEventListener(canvas, runtime);
  if ('ResizeObserver' in window) {
    registerCanvasResizeEventListener(canvas, runtime);
  }
  runtime.run(wasm);
}