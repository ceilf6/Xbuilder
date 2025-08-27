import { UI } from "./base";

/**
 * Component MobileKeyboardView initializes the mobile keyboard instance.
 *
 * Sample:
 * ```vue
 * <MobileKeyboardView>
 *   <template #gameView>
 *     <!-- Game rendering area -->
 *   </template>
 * </MobileKeyboardView>
 * ```
 */
export declare function MobileKeyboardView(): UI;

/**
 * ZoneId enumerates all available button zones on the mobile keyboard.
 *
 */
export type ZoneId =
  | "lt"
  | "rt"
  | "lbUp"
  | "lbLeft"
  | "lbRight"
  | "lbDown"
  | "rbA"
  | "rbB"
  | "rbX"
  | "rbY";

/**
 * MobileKeyboard manager
 */
export interface MobileKeyboard {
  zoneToKey: Record<ZoneId, string | null>;

  updateMapping(payload: BackendPayload): void;
}

export type BackendPayload = Partial<Record<ZoneId, string>>;

export declare function useMobileKeyboard(): MobileKeyboard;
