# 蓝色大肥鱼桌宠

一只基于蓝色大肥鱼意象进行二次创作的 Windows 桌面宠物。她会跟随本地时间作息，能被拖动、点击、投喂和摸头，也会在你从锁屏回来时随机伸懒腰或被惊醒。

> 本项目是社区二创，不隶属于、也不代表 DeepSeek 官方。仓库中的角色立绘来自项目发起者提供的创作素材；如需公开分发，请确认你拥有对应素材的使用与再授权权利。

## 功能

- 透明、无边框、置顶桌宠窗口与系统托盘
- 固定 `340 × 430` 桌宠交互区域，靠近屏幕边缘不会拉伸气泡
- 待机呼吸浮动与 2.8-7 秒不定时整帧眨眼
- 点击、双击、拖拽、鼠标悬停和键盘操作反馈
- 右键菜单：聊天、投喂、摸头、陪玩、置顶、设置、隐藏、退出
- 生理时钟：清晨、专注、午饭、下午、晚间、睡眠七段状态
- 自动散步、洗碗、加班喝咖啡、抱鲸鱼玩偶、坐下和睡觉场景
- 头发、脸蛋、腿部区域感应：卖萌、害羞、绊倒，连续绊倒后会拿手帕哭哭
- 饥饿咕咕叫、震惊蘑菇云、双枪模式、飞行、涨价和模型梗台词
- 随机闲置彩蛋与 31 张固定锚点 PNG 表情、道具和动作帧
- 监听 Windows 锁屏、解锁和系统恢复事件
- 解锁后随机触发“伸懒腰”或“惊醒”
- 内置聊天面板，保留最近十轮上下文
- 默认使用免 Key 的 Pollinations OpenAI 兼容接口
- 可切换 DeepSeek 或任意 OpenAI 兼容 API
- API Key 使用 Electron `safeStorage` 调用系统能力加密后落盘

## 快速开始

环境要求：Windows 10/11、Node.js 20 或更高版本。

```powershell
npm install
npm start
```

交互方式：

| 操作 | 反馈 |
| --- | --- |
| 鼠标悬停 | 抬头轻晃并显示当前作息台词 |
| 散步时经过头发 | 随机眯眼卖萌或自信 pose |
| 散步时经过脸蛋 | 捂脸害羞、脸红 |
| 散步时经过腿 | 绊倒；短时间多次绊倒后会拿手帕哭哭 |
| 单击 | 触发点击台词和爱心粒子 |
| 双击 | 打开聊天面板 |
| 按住拖动 | 移动桌宠，松手后给出拖拽反馈 |
| 快速绕圈拖动 | 松手后触发晕眩、转圈星星与专属台词 |
| 右键 | 回应“干嘛？”并打开桌宠菜单与设置入口 |
| `Enter` / 空格 | 聚焦宠物后打开聊天 |

关闭聊天或设置窗口不会退出桌宠；请从托盘或右键菜单选择“退出大肥鱼”。

## 模型设置

右键桌宠并选择“设置”。

### 免费模型（默认）

- API 地址：`https://text.pollinations.ai/openai`
- 模型：`openai-fast`
- 不要求 API Key

免费公共服务可能有频率限制、可用性波动或隐私条款变化。不要发送密码、身份证号、内部代码等敏感内容。

### DeepSeek

- API 地址：`https://api.deepseek.com/chat/completions`
- 模型：`deepseek-chat`
- 在设置页填写你自己的 API Key

Key 不会发送到渲染页面，也不会写入仓库。主进程只在发起模型请求时解密使用。

### 自定义 OpenAI 兼容服务

选择“自定义”，填写完整的 HTTPS Chat Completions 地址、模型名与可选 API Key。当前版本仅支持非流式响应。

## 开发与验证

```powershell
npm test
npm run check
npm run pack
```

- `npm test`：测试生理时钟、行为目录与聊天请求构造
- `npm run check`：检查关键文件存在且所有脚本语法有效
- `npm run pack`：生成未安装目录，用于快速验证 Electron 打包
- `npm run dist`：生成 NSIS 安装包和便携版

可以用内置截图模式检查指定动作在真实透明窗口中的构图：

```powershell
.\node_modules\.bin\electron.cmd . --smoke-test --smoke-action=ciallo --smoke-wait=520 --smoke-dir=.\work\smoke-ciallo
```

打包产物位于 `dist/`。

## 项目结构

```text
deepfish-desktop-pet/
├─ assets/                 # 原始立绘与固定锚点动作帧
├─ scripts/                # 静态检查与动作帧处理脚本
├─ src/
│  ├─ main/                # 窗口、托盘、系统事件、模型请求、设置存储
│  ├─ renderer/            # 桌宠、聊天与设置界面
│  ├─ shared/              # 可独立测试的作息与行为目录
│  └─ preload.cjs          # 最小化 IPC 桥接
└─ test/                   # Node.js 内置测试
```

## 更换角色素材

运行时会在 `assets/frames/` 中切换同尺寸、同锚点的透明 PNG，避免表情和道具随姿势发生错位。`frame-neutral.png` 是待机图，`frame-blink.png` 仅闭合双眼用于自然眨眼，`frame-walk.png` 与 `frame-walk-b.png` 组成变速散步循环，其余 `frame-<动作>.png` 对应行为目录中的动作名称。替换角色时应成套重绘这些帧，并保持每张画布尺寸和脚底锚点一致；`assets/character.png` 保留为原始立绘与托盘图标来源。

新动作素材应先生成完整角色白底图，确认脸、双手、头发、裙摆、鲸尾和双脚都完整，再转换为项目帧。开发依赖为 Pillow 和 NumPy：

```powershell
python scripts\prepare-generated-frame.py input.jpg assets\frames\frame-ciallo.png --alternate-output assets\frames\frame-ciallo-b.png
```

脚本会从画布边缘移除白底，将角色缩放到 `438 × 495` 透明画布，并统一为底部居中的脚底锚点。`--alternate-output` 只生成无部件拆分的轻微整体摆动；正式复杂动作应使用独立绘制的完整角色帧。多帧动作在 `src/renderer/app.js` 的 `frameSequences` 中登记，运行时按顺序切换整张图片。

身份一致性检查必须包含：头顶弯曲蓝色呆毛、画面右侧的单个蓝色蝴蝶结、围裙中央 DeepSeek 蓝色鲸鱼图标。生成图缺少图标时，可用 `scripts/stamp-apron-emblem.py` 从基准帧提取并烘焙规范徽章；白底表情参考可用 `scripts/extract-reference-frame.py` 提取角色连通区域。两种处理都会生成完整 PNG，不依赖运行时 CSS 五官或道具覆盖。

All expression assets are bundled locally. The running app does not call Coze, an image-generation service, or any remote image endpoint; Coze was used only as an optional authoring tool for the checked-in PNG source art.

## 隐私与安全

- Electron 渲染进程启用 `contextIsolation` 和沙箱，关闭 Node.js 集成。
- 自定义 API 地址必须使用 HTTPS。
- 模型请求由主进程发起，API Key 不暴露给页面脚本。
- 设置保存在 Electron `userData` 目录，Key 字段为系统加密密文。
- 公共免费模型的请求会离开本机，请先阅读服务提供方条款。

## 路线图

- 增加更多手绘过渡帧，或升级为 Live2D / Spine 分层动画
- 音效包和语音合成
- 番茄钟、待办提醒和日历彩蛋
- 多显示器边缘吸附与桌面漫步
- 自动更新与签名安装包

## 许可

源代码使用 [MIT License](./LICENSE)。角色立绘不因源代码许可自动获得再授权；公开发布前请单独确认素材权利。
