import { UI, useModal } from "./base";
import type { MobileKeyboardZoneToKeyMapping } from "./module_MobileKeyboardAPIs";

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

// export interface KeyboardLayoutConfig {
//   zones: Record<string, string | null>;
// }

// export interface KeyboardEditorModalProps {
//   initial?: KeyboardLayoutConfig | null;
// }

// const openKeyboardEditor = useModal(KeyboardEditorModal);
// const result = await openKeyboardEditor({
//   initial: null,
// } as KeyboardEditorModalProps);

// if (result) {
//   const mobileService: ProjectService = {} as any;
//   await mobileService.updateProject("owner", "projectName", {
//     mobileKeyboardType: 2,
//     mobileKeyboardZoneToKey: MobileKeyboardZoneToKeyMapping,
//   });
//   console.log("键盘配置已保存到后端:", result);
// } else {
//   console.log("用户取消了");
// }
