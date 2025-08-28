const canvas = document.querySelector("#game-canvas") as HTMLElement;
export function dispatchKeyToEvent(type: string, key: string, code: string) {
  const event = new KeyboardEvent(type, { key, code, bubbles: true });
  canvas.dispatchEvent(event);
}
