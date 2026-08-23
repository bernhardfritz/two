interface FlatlandResizeEvent {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface FlatlandResizeEventListenerObject {
  handleResizeEvent(resizeEvent: FlatlandResizeEvent): void;
}

export function registerCanvasResizeEventListener(canvas: HTMLCanvasElement, flatlandResizeEventListenerObject: FlatlandResizeEventListenerObject): () => void {
  const resizeObserver = new ResizeObserver(() => {
    flatlandResizeEventListenerObject.handleResizeEvent({ width: canvas.clientWidth, height: canvas.clientHeight, devicePixelRatio: window.devicePixelRatio });
  });
  resizeObserver.observe(canvas);
  
  return () => {
    resizeObserver.unobserve(canvas);
  };
}