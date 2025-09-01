import type { ProjectRunnerInstance } from "./projectRunner";
/**
 * Valid mobile keyboard zones
 */
export const MOBILE_KEYBOARD_ZONES = [
  "lt",
  "rt",
  "lbUp",
  "lbLeft",
  "lbRight",
  "lbDown",
  "rbA",
  "rbB",
  "rbX",
  "rbY",
] as const;

export type MobileKeyboardZone = (typeof MOBILE_KEYBOARD_ZONES)[number];
/**
 * Zone to key mapping for mobile keyboard
 */
export type MobileKeyboardZoneToKeyMapping = {
  [zone in MobileKeyboardZone]: string | null;
};
export enum MobileKeyboardType {
  NoKeyboard = 1,
  CustomKeyboard = 2,
}
export type KeyboardConfig = {
  type: MobileKeyboardType;
  mapping: MobileKeyboardZoneToKeyMapping;
};
export type UI = any;

export declare function useModal<T>(
  component: any
): (props?: any) => Promise<T>;

/**
 * ## Features
 * - expand phone Layout
 * - provide  key pool
 * - Supports key dragging, dropping, and overlap detection
 */
export declare function KeyboardEditorModal(
  props: {
    initial: MobileKeyboardZoneToKeyMapping;
  },
  emits: {
    resolved: (result: MobileKeyboardZoneToKeyMapping) => void;
  }
): UI;

/**
 * Mobile Keyboard View Component
 *
 * Manages the mobile keyboard layout and handles key event dispatching to ProjectRunner.
 * This component acts as the bridge between UIKeyBtn components and ProjectRunner.
 *
 * ## Architecture:
 * 1. Receives ProjectRunner through gameView slot
 * 2. Gets reference to ProjectRunner component
 * 3. Creates handleKeyEvent function that calls projectRunnerRef.dispatchKeyToEvent
 * 4. Passes handleKeyEvent to all UIKeyBtn components via onKeyEvent prop
 *
 * ## Props:
 * - `initial`: Initial keyboard zone to key mapping configuration
 *
 * ## Slots:
 * - `gameView`: Should contain ProjectRunner component with ref
 *
 * use:
 * ```vue
 * let projectRunnerRef: ProjectRunnerInstance | null = null;
 *
 * <MobileKeyboardView :initial="{ zones: { lt: 'Q', rt: 'E' } }" :projectRunnerRef="projectRunnerRef">
 *   <template >
 *     <ProjectRunner ref="projectRunnerRef" :project="project" />
 *   </template>
 * </MobileKeyboardView>
 * ```
 */
export type MobileKeyboardViewProps = {
  initial: MobileKeyboardZoneToKeyMapping;
  projectRunnerRef: ProjectRunnerInstance | null;
};

export function MobileKeyboardView({
  initial,
  projectRunnerRef,
}: MobileKeyboardViewProps): UI {
  const zones = Object.keys(initial);
  const zoneToKey = initial;

  const handleKeyEvent = (type: string, key: string, code: string) => {
    projectRunnerRef?.dispatchKeyToEvent(type, key, code);
  };

  const keyButtons = zones
    .map(
      (zone) =>
        `<UIKeyBtn key="${zone}" value="${zoneToKey[zone]}" active={true} onKeyEvent=${handleKeyEvent} />`
    )
    .join("");

  return `
    <div className="phone-layout">
      <slot name="gameView">
      </slot>
      <div className="keyboard-zones">
        ${keyButtons}
      </div>
    </div>
  `;
}

//  key UI in Keyboard. provide to MobileKeyboardView and MobileKeyboardEidt
// active is used to indicate whether a button has functionality（onKeyEvent）.
export declare function UIKeyBtn(props: {
  value: string;
  active?: boolean;
  onKeyEvent?: (type: "keydown" | "keyup", key: string, code: string) => void;
}): UI;
// {
//   function toKeyAndCode(v: string) {
//     // preprocessing
//     return { key: v, code: v };
//   }

//   function dispatchKey(type: "keydown" | "keyup", v: string) {
//     const { key, code } = toKeyAndCode(v);
//     props.onKeyEvent?.(type, key, code);
//   }

//   let isPressed = false;
//   function press(down: boolean) {
//     if (down && !isPressed) {
//       isPressed = true;
//       dispatchKey("keydown", props.value);
//     } else if (!down && isPressed) {
//       isPressed = false;
//       dispatchKey("keyup", props.value);
//     }
//   }
// }
