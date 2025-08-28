import { dispatchKeyToEvent } from "./projectRunner";
import { UI } from "./base";

export function UIKeyBtn(props: { value: string; active?: boolean }): UI {
  function toKeyAndCode(v: string) {
    // preprocessing
    return { key: v, code: v };
  }

  function dispatchKey(type: "keydown" | "keyup", v: string) {
    const { key, code } = toKeyAndCode(v);
    dispatchKeyToEvent(type, key, code);
  }
  let isPressed = false;
  function press(down: boolean) {
    if (down && !isPressed) {
      isPressed = true;
      dispatchKey("keydown", props.value);
    } else if (!down && isPressed) {
      isPressed = false;
      dispatchKey("keyup", props.value);
    }
  }
}
