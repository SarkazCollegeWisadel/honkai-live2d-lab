# 语音与 LLM 接入计划

2026-09-11 更新：用户已授权实施并提供 Step 试用凭证，云端语音与文本工具调用已实测。本地 TTS 因冷启动卡顿按用户要求停止，不再作为当前默认。详见[验证记录](validation-2026-09-11.md)。

## 本地 Q 语音

现有启动器开启网页界面及兼容 API。尽管所在目录沿用 Qwen3-TTS 名称，启动源码默认选择 IndexTTS 分支，健康接口将其标识为 IndexTTS-2.5，也可通过环境配置选择 GPT-SoVITS。实际运行引擎尚未查询。

- 界面：`http://127.0.0.1:7862/`。
- 兼容 API base URL：`http://127.0.0.1:9881/v1`。
- 合成：`POST /audio/speech`；模型与音色列表使用 `/models` 和 `/audio/voices`。
- 当前模型与音色 ID 均为 `Q`。接口虽接受 model/voice 字段，合成处理函数未按其值切换角色声线；不能仅改 voice 字段就得到两个角色的声音。
- 请求支持 input、response_format、speed 和 instructions，默认返回 MP3；情绪指令会传入下游。
- 当前实现先完成文本分段、音频合并，再返回完整音频，不是逐块流式响应。

保留接口资料供未来用户主动要求时恢复。本次冷启动未完成完整语音验收，不能声称本地链路通过；当前不再自动启动本地服务。角色声线配置与试听后续独立处理。

## Step Token Plan

根据[官方套餐语音接入文档](https://platform.stepfun.com/docs/zh/step-plan/integrations/audio-api)与[语音合成 API](https://platform.stepfun.com/docs/zh/api-reference/audio/create-audio)，套餐应使用：

`POST https://api.stepfun.com/step_plan/v1/audio/speech`

套餐文档列出 `stepaudio-2.5-tts`；请求需要 model、input、voice。保留自定义 base URL、模型及音色配置。套餐路径与普通按量接口区分，实际账户权限和额度在联调时验证。

基础音频先按兼容接口测试。情绪扩展需要单独映射：Q 使用 instructions，Step 文档使用 instruction；不能假设替换 base URL 后所有扩展能力都自动兼容。

## DeepSeek

用户接受 DeepSeek，也已授权使用 Step 的合适文本模型。当前先用 Step 3.7 Flash 完成整条链路，DeepSeek 保留为可替换选项。[官方文档](https://api-docs.deepseek.com/)确认 DeepSeek 支持 OpenAI 兼容格式，base URL 为 `https://api.deepseek.com`。模型名称可配置，并以联调时官方文档与账户可用模型为准。

先验证文本及工具调用，再测试 AI 情绪事件驱动。模型不能直接写入任意模型参数：通过有限表情语义、参数范围和持续时间约束执行。

## 技术验证顺序

1. 检查已运行服务的健康状态与音色列表，再准备服务启动及回退步骤。
2. 本地 Q 合成短句，记录冷启动、热启动、首句延迟、音频格式。
3. AIRI 加载兼容样例，验证播放、嘴部复位、表情保持及播放打断；播放打断与取消后台推理分开验证。
4. 环境就绪后配置临时 DeepSeek Key，验证对话与表情工具调用。
5. 配置 Step Token Plan 后验证云端语音切换、情绪指令和故障提示。

密钥仅存本地忽略目录或环境变量，不进入源码、日志或公共仓库。测试结束清除本地临时凭证，并请用户在提供商控制台撤销调试 Key；本地删除不能代替服务端撤销。
