# AIRI 表情桥接原型

`expression-bridge.mjs` 将 normal、confused、happy、pout、wink、smile 六种语义映射到角色参数。支持平滑过渡、自动复位和新指令打断；保留口型开合与呼吸参数给原有驱动。

已验证 AIRI v0.12.0-beta.5 的实际对话、工具执行、Step 语音、口型、停止播放和重启后重新连接。仍是实验性运行时接入，不是 AIRI 正式插件；尚无正式月下或格蕾修预设。

```js
import { createExpressionBridge, expressionTool } from './expression-bridge.mjs';
const bridge = createExpressionBridge(expressionStore, characterPresets);
toolsStore.addTools(expressionTool(bridge));
// characterPresets: { normal: [], happy: [{ id, blend, value }], ... }
// 工具默认不启用；对话需显式选择 honkai_set_expression。
```

测试：`node --test tests/expression-bridge.test.mjs`。

已测试混合模式中性值、保护口型参数、连续表情打断、计时复位与输入错误。实际验证改用 DeepSeek 原生 provider，关闭 thinking；Step 仅负责语音。独立角色卡避免默认提示词将函数调用变成普通 CALL 文本。

## 连接已配置的 AIRI

需要 Node.js 22、AIRI v0.12.0-beta.5，并先在 AIRI 配置文本服务、语音和导入准备好的 Haru 样例。密钥在 AIRI 设置或本地环境配置，脚本无需读取密钥。

用 `airi.exe --remote-debugging-port=9334` 启动 AIRI，再运行：

```powershell
node scripts/connect-airi.mjs install --app D:/tool/AIRI
node scripts/connect-airi.mjs chat --app D:/tool/AIRI --text '开心地和我打个招呼'
node scripts/connect-airi.mjs expression --app D:/tool/AIRI --emotion wink --duration 1500
node scripts/connect-airi.mjs stop --app D:/tool/AIRI
node scripts/connect-airi.mjs status --app D:/tool/AIRI
```

安装目录请替换为本机路径。`install` 默认使用已加载 Haru 的样例表情；正式角色使用 `--presets 自己的参数映射.json`。重启 AIRI 后需要重新运行 `install`，角色卡、服务和模型本身由 AIRI 保存。命令只连接 localhost，核对主窗口确实来自指定安装目录。

`chat` 显式启用表情工具；AIRI 自身聊天可在工具选择器选择 `honkai_set_expression`，同一会话的后续消息会继承此前所选工具。脚本返回时文本可能已完成而 TTS 仍在排队，`status` 可以查看实际播放状态。`stop` 停止语音及恢复表情，不取消已经提交的文本请求。

目前保持时间从表情工具执行时计算，尚未实现按声音播放起点对齐。更换模型后须重新连接并提供对应预设，不能沿用旧模型的参数引用。
