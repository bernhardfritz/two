interface FlatlandMouseEvent {
  mouseX: number,
  mouseY: number,
  mouseButtons?: number,
}

export interface FlatlandMouseEventListenerObject {
  handleMouseEvent(mouseEvent: FlatlandMouseEvent): void;
}

export function registerCanvasMouseEventListener(canvas: HTMLCanvasElement, flatlandMouseEventListenerObject: FlatlandMouseEventListenerObject) {
  const mouseEventListenerObject = {
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
  const pointerEventListenerObject = {
    handleEvent: (event: PointerEvent) => {
      event.preventDefault();
    }
  }
  canvas.addEventListener('mousedown', mouseEventListenerObject);
  canvas.addEventListener('mousemove', mouseEventListenerObject);
  canvas.addEventListener('mouseup', mouseEventListenerObject);
  canvas.addEventListener('contextmenu', pointerEventListenerObject);

  return () => {
    canvas.removeEventListener('mousedown', mouseEventListenerObject);
    canvas.removeEventListener('mousemove', mouseEventListenerObject);
    canvas.removeEventListener('mouseup', mouseEventListenerObject);
    canvas.removeEventListener('contextmenu', pointerEventListenerObject);
  }
}