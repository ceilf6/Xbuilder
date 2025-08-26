import { UI, useModal } from "./base";
import {
  UpdateMobileAdaptationParams,
  MobileAdaptationService,
} from "./module_Keyboard";
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

const openKeyboardEditor = useModal(KeyboardEditorModal);
const result = await openKeyboardEditor({
  initial: null,
} as KeyboardEditorModalProps);

if (result) {
  const mobileService: MobileAdaptationService = {} as any;
  await mobileService.updateMobileAdaptation("owner", "projectName", {
    adaptationType: 2,
    zoneToKey: result,
  });
  console.log("键盘配置已保存到后端:", result);
} else {
  console.log("用户取消了");
}
