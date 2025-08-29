import { UI } from "./base";
//  key UI in Keyboard. provide to MobileKeyboardView and MobileKeyboardEidt
// active is used to indicate whether a button has functionality.
export function UIKeyBtn(props: {
  value: string;
  active?: boolean;
  onKeyEvent?: (type: "keydown" | "keyup", key: string, code: string) => void;
}): UI {
  function toKeyAndCode(v: string) {
    // preprocessing
    return { key: v, code: v };
  }

  function dispatchKey(type: "keydown" | "keyup", v: string) {
    const { key, code } = toKeyAndCode(v);
    props.onKeyEvent?.(type, key, code);
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
