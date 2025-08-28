import { UI, useModal } from "./base";
import type { MobileKeyboardZoneToKeyMapping } from "./base";

/**
 * ## Features
 * - expand phone Layout
 * - provide  key pool
 * - Supports key dragging, dropping, and overlap detection
 *
 * ## Sample
 * ```vue
 * <KeyboardEditorModal
 *   :initial="{ zones: { lt: 'Q', rt: 'E' } }"
 * />
 * ```
 */
export declare function KeyboardEditorModal(props: {
  initial: MobileKeyboardZoneToKeyMapping;
}): UI;
