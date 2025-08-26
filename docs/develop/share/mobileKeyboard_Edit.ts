import { UI } from "./base";

/**
 * ## Features
 * - expand phone Layout
 * - provide  key pool
 * - Supports key dragging, dropping, and overlap detection
 * - Users can cancel or confirm the configuration, which outputs the final keyboard layout.
 *
 * ## Sample
 * ```vue
 * <KeyboardEditorModal
 *   :initial="{ zones: { lt: 'Q', rt: 'E' } }"
 *   @resolved="onConfirm"
 *   @cancelled="onCancel"
 * />
 * ```
 */
export declare function KeyboardEditorModal(): UI;

export interface KeyboardLayoutConfig {
  zones: Record<string, string | null>;
}

export interface KeyboardEditorModalProps {
  initial?: KeyboardLayoutConfig | null;
}

export interface KeyboardEditorModalEmits {
  (e: "resolved", config: KeyboardLayoutConfig): void;
  (e: "cancelled"): void;
}
