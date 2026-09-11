# 调研来源与参考状态

查阅日期：2026-09-11。未对以下项目执行安装或运行测试。

## 制作工具

| 项目 | 用途与判断 |
|---|---|
| [Live2D Cubism](https://www.live2d.com/) | 标准模型制作与工程编辑候选；用户接受使用，具体版本及授权成本按需要确认。 |
| [See-through](https://github.com/shitagaki-lab/see-through) | 自动拆层、补全遮挡；项目明确区分拆层与完整 Live2D 绑定，适合作为辅助。 |
| [image2live2d](https://github.com/Wzhang3912/image2live2d) | 自动网格、绑定与导出候选。README 声称支持 `.moc3`，`.cmo3` 仍实验性，需验证可编辑性、画质及兼容性；不作为已成熟的全自动生产保证。 |
| [Inochi Creator](https://github.com/Inochi2D/inochi-creator) | 开源 2D 角色编辑器，但格式与标准 Live2D 不兼容，暂不作为 P2G 主线。 |

## 驱动与面捕

| 项目 | 用途与判断 |
|---|---|
| [Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber) | 提供 Live2D、独立聊天、ASR/TTS、表情与桌面模式等能力；README 表示 v2 正在规划重写，v1 仍修复缺陷。需选定可复现版本，不能将 v2 规划当已交付功能。 |
| [AIRI](https://github.com/moeru-ai/airi) | Live2D、桌面/网页 AI 伴侣与多种语音服务候选，适合考察可扩展性；实际插件与目标 TTS 兼容性待测。 |
| [OpenSeeFace](https://github.com/emilianavt/OpenSeeFace) | 普通摄像头面部追踪组件，不负责制作模型；是否额外独立部署取决于选定面捕软件。 |
| [VTube Studio API](https://github.com/DenchiSoft/VTubeStudio) | 面捕与互动软件的 API 文档/示例仓库，不应将它等同于完整应用开源。 |

## 用户质量参考

- 最初提供的 B 站参考：<https://www.bilibili.com/video/BV1aHcSzLEt6/>。网页读取失败，未据此声称完成动作分析。
- 后提供本地视频 `演示-导入过程.mp4`：1920×1080、30 fps、约 172 秒。已抽取概览和前 60 秒的动作样本，只用于本地分析，不上传原视频与抽帧。
- 样本可见：角色眨眼、不同眼口表情、轻微头部姿态变化、发束位置变化，以及触摸区域触发表情/台词的展示。
- 后半段包含 `.lpk` 导入教程。该封装不是 P2G 要求的标准 Live2D ZIP，不能直接照搬导入流程。
- 抽帧不能完整证明运动平滑度、低延迟面捕或高阶嘴型；这些需后续连续播放验收。

## 常服参考检索

尚未完成满足“角色正确、确为常服、作者可追溯、有人气指标”的正式候选清单，未定款。

已找到的人气检索线索（不是已核验的设计推荐）：

- [A date with Luna](https://www.reddit.com/r/houkai3rd/comments/16mk164/)：搜索缓存显示约 437 分；原帖读取失败，原图、作者及具体衣装待核验。
- [Stunning Luna (by CHIARA爱東東)](https://www.reddit.com/r/houkai3rd/comments/1kegfs9/)：搜索缓存显示约 414 分；原帖读取失败，原始发布来源及具体衣装待核验。

以上数值是搜索缓存中的社区热度，不是美术质量评分或当前实时点赞。后续需看到原图、验证大月下身份与服饰，再提交用户审阅。

选定参考后区分“借鉴服装方向重新设计”与“直接使用/修改原画”；是否能将素材公开分发需依据具体来源确认。
