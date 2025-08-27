import { useModal } from "./base";
import { ZoneId, zoneToKey } from "./base";

// 模拟移动端键盘编辑器的使用
function MobileKeyboardEditExample() {
  // 初始化键盘配置
  const initialConfig = {
    zones: {
      lt: "Q",
      rt: "E",
      lbUp: "W",
      lbLeft: "A",
      lbRight: "D",
      lbDown: "S",
      rbA: " ",
      rbB: null,
      rbX: "J",
      rbY: "K",
    } as zoneToKey,
  };

  const openKeyboardEditor = useModal("MobileKeyboardEdit");

  async function handleEditKeyboard() {
    try {
      const result = (await openKeyboardEditor({
        initial: initialConfig,
      })) as { zones: zoneToKey };

      const keyboardConfig = {
        type: 2,
        mapping: result.zones,
      };

      // 应用到项目配置
      -keyboardConfig;

      return keyboardConfig;
    } catch (error) {
      if (error.name === "Cancelled") {
        console.log("User cancelled keyboard editing");
        return null;
      }
      throw error;
    }
  }

  function applyKeyboardConfig(config: {
    type: number;
    mapping: Record<string, string | null>;
  }) {
    // 模拟应用键盘配置到项目
    console.log("Applying keyboard configuration:", config);

    // 在实际应用中，这里会：
    // 1. 更新项目的 mobileKeyboardType
    // 2. 更新项目的 mobileKeyboardZoneToKey
    // 3. 保存到云端或本地
  }

  // 模拟拖拽操作
  function simulateDragAndDrop() {
    // 模拟从键盘池拖拽 'F' 键到左上角区域
    const draggedKey = "F";
    const targetZone: ZoneId = "lt";

    console.log(`Dragging key "${draggedKey}" to zone "${targetZone}"`);

    // 模拟拖拽完成
    const updatedConfig = {
      zones: {
        ...initialConfig.zones,
        [targetZone]: draggedKey,
      } as zoneToKey,
    };

    return updatedConfig;
  }

  // 模拟验证键盘配置
  function validateKeyboardConfig(config: {
    zones: Record<string, string | null>;
  }) {
    const configuredZones = Object.entries(config.zones).filter(
      ([_, key]) => key !== null
    ).length;

    console.log(
      `Configured ${configuredZones} out of ${
        Object.keys(config.zones).length
      } zones`
    );

    // 检查是否有重复的键位映射
    const usedKeys = Object.values(config.zones).filter((key) => key !== null);
    const duplicateKeys = usedKeys.filter(
      (key, index) => usedKeys.indexOf(key) !== index
    );

    if (duplicateKeys.length > 0) {
      console.warn("Duplicate key mappings found:", duplicateKeys);
      return false;
    }

    return true;
  }

  // 模拟重置键盘配置
  function resetKeyboardConfig() {
    return {
      zones: {
        lt: null,
        rt: null,
        lbUp: null,
        lbLeft: null,
        lbRight: null,
        lbDown: null,
        rbA: null,
        rbB: null,
        rbX: null,
        rbY: null,
      },
    };
  }

  // 返回公共接口
  return {
    handleEditKeyboard,
    simulateDragAndDrop,
    validateKeyboardConfig,
    resetKeyboardConfig,
    initialConfig,
  };
}

// 使用示例
const keyboardEditor = MobileKeyboardEditExample();

// 模拟用户点击编辑键盘按钮
async function exampleUsage() {
  console.log("=== Mobile Keyboard Edit Example ===");

  // 1. 显示初始配置
  console.log("Initial configuration:", keyboardEditor.initialConfig);

  // 2. 验证配置
  const isValid = keyboardEditor.validateKeyboardConfig(
    keyboardEditor.initialConfig
  );
  console.log("Configuration is valid:", isValid);

  // 3. 模拟拖拽操作
  const dragResult = keyboardEditor.simulateDragAndDrop();
  console.log("After drag and drop:", dragResult);

  // 4. 模拟打开编辑器 (在真实环境中会打开模态框)
  console.log("Opening keyboard editor...");
  // const finalConfig = await keyboardEditor.handleEditKeyboard()

  // 5. 模拟重置
  const resetConfig = keyboardEditor.resetKeyboardConfig();
  console.log("Reset configuration:", resetConfig);
}

// 运行示例
// exampleUsage()

export { MobileKeyboardEditExample, exampleUsage };
