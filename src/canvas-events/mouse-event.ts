interface FlatlandMouseEvent {
  mouseX: number,
  mouseY: number,
  mouseButtons?: number,
}

export interface FlatlandMouseEventListenerObject {
  handleMouseEvent(mouseEvent: FlatlandMouseEvent): void;
}

export function registerCanvasMouseEventListener(canvas: HTMLCanvasElement, flatlandMouseEventListenerObject: FlatlandMouseEventListenerObject) {
  const eventListenerObject = {
    handleEvent: (event: MouseEvent) => {
      event.preventDefault();
      const boundingClientRect = canvas.getBoundingClientRect();
      switch (event.type) {
        // @ts-ignore: Fallthrough case in switch
        case 'mousedown':
          canvas.focus();
        case 'mouseup':
          flatlandMouseEventListenerObject.handleMouseEvent({ mouseX: event.clientX - boundingClientRect.left, mouseY: event.clientY - boundingClientRect.top, mouseButtons: event.buttons });
          break;
        case 'mousemove':
          flatlandMouseEventListenerObject.handleMouseEvent({ mouseX: event.clientX - boundingClientRect.left, mouseY: event.clientY - boundingClientRect.top });
          break;
      }
    }
  };
  canvas.addEventListener('mousedown', eventListenerObject);
  canvas.addEventListener('mousemove', eventListenerObject);
  canvas.addEventListener('mouseup', eventListenerObject);

  return () => {
    canvas.removeEventListener('mousedown', eventListenerObject);
    canvas.removeEventListener('mousemove', eventListenerObject);
    canvas.removeEventListener('mouseup', eventListenerObject);
  }
}