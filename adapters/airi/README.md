# AIRI 表情桥接原型

`expression-bridge.mjs` 将 normal、confused、happy、pout、wink、smile 六种语义映射到角色参数。支持平滑过渡、自动复位和新指令打断；保留口型开合与呼吸参数给原有驱动。

当前仅验证 AIRI v0.12.0-beta.5 的运行时表达式数据结构与独立逻辑测试，不是可安装插件。模型预设需调用方提供，尚无正式月下或格蕾修预设。

```js
import { createExpressionBridge, expressionTool } from './expression-bridge.mjs';
const bridge = createExpressionBridge(expressionStore, characterPresets);
toolsStore.addTools(expressionTool(bridge));
// characterPresets: { normal: [], happy: [{ id, blend, value }], ... }
// 工具默认不启用；对话需显式选择 honkai_set_expression。
```

测试：`node --test tests/expression-bridge.test.mjs`。

已测试混合模式中性值、保护口型参数、连续表情打断、计时复位与输入错误。AIRI 实际聊天仍受默认提示词和 Step 推理配置影响，尚未通过完整工具调用验收。下一步为独立角色配置、实际工具执行、语音联动及持久化安装，不应把单元测试视为完整集成成功。
