import { UI } from "./base";
import { MobileKeyboardZoneToKeyMapping } from "./base";
import type { ProjectRunnerInstance } from "./projectRunner";
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
 * <MobileKeyboardView :initial="{ zones: { lt: 'Q', rt: 'E' } }">
 *   <template #gameView="{ projectRunnerRef }">
 *     <ProjectRunner ref="projectRunnerRef" :project="project" />
 *   </template>
 * </MobileKeyboardView>
 * ```
 */
export type MobileKeyboardViewProps = {
  initial: MobileKeyboardZoneToKeyMapping;
  gameView: { value?: ProjectRunnerInstance };
};

export function MobileKeyboardView({
  initial,
  gameView,
}: MobileKeyboardViewProps): UI {
  const zones = Object.keys(initial);
  const zoneToKey = initial;
  const handleKeyEvent = (type: string, key: string, code: string) => {
    gameView.value?.dispatchKeyToEvent(type, key, code);
  };
  const keyButtons = zones
    .map(
      (zone) =>
        `<UIKeyBtn key="${zone}" value="${zoneToKey[zone]}" active={true} onKeyEvent=${handleKeyEvent} />`
    )
    .join("");

  return `
    <div className="phone-layout">
      ${gameView}
      <div className="keyboard-zones">
        ${keyButtons}
      </div>
    </div>
  `;
}
