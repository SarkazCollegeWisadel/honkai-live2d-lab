# AIRI 源码评估

日期：2026-09-11。检查基准：`3fcae726c566d9937672e81b9829e0b41c6252ed`。方式：读取官方仓库说明和关键源文件，未安装或运行。

结论：AIRI 适合作为大月下/小格蕾修共用的独立 AI 互动端首选验证对象。标准 Live2D 制作、面捕配置及 P2G 适配仍是独立环节。

## 已见源码依据

| 能力 | 依据 | 对本项目的意义 |
|---|---|---|
| 表情参数工具 | `expression_set/get/toggle/reset_all/save_defaults`，支持数值和定时恢复 | 可设计开心、疑惑、娇嗔、wink、微笑等语义触发，实际 LLM 调用链待验证 |
| 标准表情文件 | 控制器读取 `model3.json` 的 Expressions 和 `.exp3.json` | 与标准 Cubism 交付方向一致 |
| 动作语义 | emotion 常量定义 Happy、Angry、Question、Idle 等动作映射 | 角色包可建立稳定动作名，并扩展区分 happy/smile 等需求 |
| 可分离动作驱动 | MAGIC 驱动包提供姿态转换、调度、过滤、目标适配接口 | 后续研究自动动作生成与不同角色复用，不能将其等同于自动建模 |
| 本地软件扩展 | 桌面 MCP 服务建立 stdio 客户端、列举与调用工具 | 为用户指定的工具或软件制作适配器有基础，具体应用仍需逐项连接 |
| 语音可配置 | 官方说明列出多种云端/本地语音提供者，源码有 Provider 模块 | 先确认现有 TTS 协议，再决定直接配置或加适配器 |

## 影响验收的发现

1. 表情控制器明确忽略 `.exp3.json` 的 `FadeInTime/FadeOutTime`，并直接应用参数。需要实际验证切换效果，必要时增加插值或在动作层平滑过渡。
2. 存在表情工具不代表任意 LLM、任意配置都能可靠触发。应验证工具注册、模型函数调用支持、动作/表情命名及出错恢复。
3. 模型嘴部、眨眼、表情、待机和动作生成器可能同时写参数，需验证优先级、释放与恢复。
4. AIRI 不会替 P2G 恢复禁用的导入界面，也不保证 P2G 支持 AIRI 的互动功能。
5. 这些结论对应所检查的源码版本；发行包是否包含全部功能需另行核对。

## 拟定组合

`分层立绘 → Cubism 绑定与导出 → AIRI 独立 AI 互动 / P2G 本地导入适配 / VTube Studio 面捕`

公共项目仓库负责角色资产规范、配置模板、通用适配与验收记录。尽量通过配置和小型扩展接入 AIRI；若需要修改其源码，记录基准版本与补丁，避免维护无必要的大型分叉。

## 首轮运行验证（尚未执行）

- 加载适当的标准 Live2D 样例，确认透明背景、缩放、待机与表情。
- 手动触发与 AI 触发相同六类表情，核对定时恢复、强度及过渡。
- 接入一个用户已有 TTS，验证开始、停止、打断后的嘴部恢复。
- 仅接入明确选定的本地工具，验证工具结果到角色反馈的过程。
- 同一套角色包分别在 AIRI、P2G、VTube Studio 检查参数与表现差异。

## 官方源码链接

- [主仓库](https://github.com/moeru-ai/airi)
- [表情工具](https://github.com/moeru-ai/airi/blob/3fcae726c566d9937672e81b9829e0b41c6252ed/packages/stage-ui-live2d/src/tools/expression-tools.ts)
- [表情控制器](https://github.com/moeru-ai/airi/blob/3fcae726c566d9937672e81b9829e0b41c6252ed/packages/stage-ui-live2d/src/composables/live2d/expression-controller.ts)
- [动作语义](https://github.com/moeru-ai/airi/blob/3fcae726c566d9937672e81b9829e0b41c6252ed/packages/stage-ui-live2d/src/constants/emotions.ts)
- [MAGIC 动作驱动](https://github.com/moeru-ai/airi/blob/3fcae726c566d9937672e81b9829e0b41c6252ed/packages/model-driver-magic-live2d/README.md)
- [桌面 MCP 服务](https://github.com/moeru-ai/airi/blob/3fcae726c566d9937672e81b9829e0b41c6252ed/apps/stage-tamagotchi/src/main/services/airi/mcp-servers/index.ts)
