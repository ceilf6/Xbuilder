import { UI } from "./base";
import { MobileKeyboardZoneToKeyMapping } from "./base";
/**
 * Component MobileKeyboardView initializes the mobile keyboard instance.
 *
 * Sample:
 * ```vue
 * <MobileKeyboardView :initial="{ zones: { lt: 'Q', rt: 'E' } }" />
 *   <template #gameView>
 *     <!-- Game rendering area -->
 *   </template>
 * </MobileKeyboardView>
 * ```
 */
export declare function MobileKeyboardView(props: {
  initial: MobileKeyboardZoneToKeyMapping;
}): UI;
