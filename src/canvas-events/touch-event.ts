import type { FlatlandMouseEventListenerObject } from './mouse-event';

export function registerCanvasTouchEventListener(canvas: HTMLCanvasElement, flatlandMouseEventListenerObject: FlatlandMouseEventListenerObject) {
  const eventListenerObject = {
    handleEvent: (event: TouchEvent) => {
      event.preventDefault();
      const boundingClientRect = canvas.getBoundingClientRect();
      const firstTouch = event.changedTouches[0];
      switch (event.type) {
        case 'touchstart':
          flatlandMouseEventListenerObject.handleMouseEvent({ mouseX: firstTouch.clientX - boundingClientRect.left, mouseY: firstTouch.clientY - boundingClientRect.top, mouseButtons: 1 });
          break;
        case 'touchend':
          flatlandMouseEventListenerObject.handleMouseEvent({ mouseX: firstTouch.clientX - boundingClientRect.left, mouseY: firstTouch.clientY - boundingClientRect.top, mouseButtons: 0 });
          break;
        case 'touchmove':
          flatlandMouseEventListenerObject.handleMouseEvent({ mouseX: firstTouch.clientX - boundingClientRect.left, mouseY: firstTouch.clientY - boundingClientRect.top });
          break;
      }
    }
  };
  canvas.addEventListener('touchstart', eventListenerObject);
  canvas.addEventListener('touchmove', eventListenerObject);
  canvas.addEventListener('touchend', eventListenerObject);

  return () => {
    canvas.removeEventListener('touchstart', eventListenerObject);
    canvas.removeEventListener('touchmove', eventListenerObject);
    canvas.removeEventListener('touchend', eventListenerObject);
  }
}