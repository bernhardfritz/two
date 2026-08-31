interface FlatlandKeyboardEvent {
  keys: bigint;
}

export interface FlatlandKeyboardEventListenerObject {
  handleKeyboardEvent(keyboardEvent: FlatlandKeyboardEvent): void;
}

function toFlatlandKeyCode(keyCode: number, location: number) {
  if (location == 2) {
    switch (keyCode) {
      case 0x10:
        return 0xEF;
      case 0x11:
        return 0xEE;
      default:
        return keyCode;
    }
  } else {
    return keyCode;
  }
}

export function registerCanvasKeyboardEventListener(canvas: HTMLCanvasElement, flatlandKeyboardEventListenerObject: FlatlandKeyboardEventListenerObject) {
  const sparseSet = new Uint8SparseSet8();
  const eventListenerObject = {
    handleEvent: (event: KeyboardEvent) => {
      event.preventDefault();
      switch (event.type) {
        case 'keydown':
          if (event.repeat) {
            return;
          }
          sparseSet.add(toFlatlandKeyCode(event.keyCode, event.location));
          break;
        case 'keyup': 
          sparseSet.delete(toFlatlandKeyCode(event.keyCode, event.location));
          break;
        default:
          return; // ignore other keyboard events
      }
      let keys = 0n;
      for (const keyCode of sparseSet) {
        keys <<= 8n;
        keys |= BigInt(keyCode);
      }
      flatlandKeyboardEventListenerObject.handleKeyboardEvent({ keys }); // TODO on the go side we need bitset, e.g. consisting of [4]uint64 0-63, 64-127, 128-191, 192-255. clearing is as easy as setting all 4 values to 0. since it's a denseSet on javascript side we can stop right shifting as soon as value is 0
    }
  };
  canvas.focus();
  canvas.addEventListener('keydown', eventListenerObject);
  canvas.addEventListener('keyup', eventListenerObject);
  
  return () => {
    canvas.removeEventListener('keydown', eventListenerObject);
    canvas.removeEventListener('keyup', eventListenerObject);
  }
}

class Uint8SparseSet8 implements Set<number> {
  #sparse: number[];
  #dense: number[];
  #size: number;

  constructor() {
    this.#sparse = new Array(256).fill(-1);
    this.#dense = new Array(8);
    this.#size = 0;
  }

  add(value: number): this {
    if (this.has(value) || this.#size === 8) {
      return this;
    }
    this.#dense[this.#size] = value;
    this.#sparse[value] = this.#size;
    this.#size++;
    
    return this;
  }

  clear(): void {
    this.#sparse.fill(-1);
    this.#size = 0;
  }

  delete(value: number): boolean {
    if (!this.has(value)) {
      return false;
    }
    const last = this.#dense[this.#size - 1];
    [this.#dense[this.#size - 1], this.#dense[this.#sparse[value]]] = [this.#dense[this.#sparse[value]], this.#dense[this.#size - 1]];
    [this.#sparse[last], this.#sparse[value]] = [this.#sparse[value], this.#sparse[last]];
    this.#size--;
    this.#sparse[value] = -1;
    
    return true;
  }

  forEach(_callbackfn: (value: number, value2: number, set: Set<number>) => void, _thisArg?: any): void {
    throw new Error("Method not implemented.");
  }

  has(value: number): boolean {
    return this.#sparse[value] !== -1;
  }

  get size(): number {
    return this.#size;
  }

  entries(): SetIterator<[number, number]> {
    throw new Error("Method not implemented.");
  }

  keys(): SetIterator<number> {
    throw new Error("Method not implemented.");
  }

  values(): SetIterator<number> {
    throw new Error("Method not implemented.");
  }

  *[Symbol.iterator](): SetIterator<number> {
    for (let i = 0; i < this.#size; i++) {
      yield this.#dense[i];
    }
  }

  get [Symbol.toStringTag](): string {
    return 'Uint8SparseArray8';
  }
}