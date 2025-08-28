import { useModal } from "./base";
import { MobileKeyboardZoneToKeyMapping, KeyboardConfig } from "./base";
import { KeyboardEditorModal } from "./module_MobileKeyboardEdit";
import type { ProjectService, ProjectData } from "./module_MobileKeyboardAPIs";
// 模拟移动端键盘编辑器的使用
async function MobileKeyboardEditExample() {
  const ProjectService: ProjectService = {} as any;
  const project: ProjectData = await ProjectService.getProject(
    "owner",
    "projectName"
  );
  // 初始化键盘配置
  const mobileKeyboardType: number = project.mobileKeyboardType;
  const initialConfig =
    project.mobileKeyboardZoneToKey as MobileKeyboardZoneToKeyMapping;

  const openKeyboardEditor = useModal(KeyboardEditorModal);

  async function handleEditKeyboard(): Promise<KeyboardConfig | null> {
    try {
      const result = (await openKeyboardEditor({
        initial: initialConfig,
      })) as { zones: MobileKeyboardZoneToKeyMapping };

      const keyboardConfig = {
        type: 2,
        mapping: result.zones,
      };
      return keyboardConfig;
    } catch (error) {
      if (error) {
        return null;
      }
      throw error;
    }
  }

  async function applyKeyboardConfig() {
    const keyboardConfig = await handleEditKeyboard();
    if (keyboardConfig) {
      ProjectService.updateProject("owner", "projectName", {
        mobileKeyboardType: keyboardConfig.type,
        mobileKeyboardZoneToKey: keyboardConfig.mapping,
      });
    }
    // 模拟应用键盘配置到项目
    // 在实际应用中，这里会：
    // 1. 更新项目的 mobileKeyboardType
    // 2. 更新项目的 mobileKeyboardZoneToKey
    // 3. 保存到云端
  }
}
