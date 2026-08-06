# 蓝色大肥鱼桌宠

一只基于蓝色大肥鱼意象进行二次创作的 Windows 桌面宠物。她会跟随本地时间作息，能被拖动、点击、投喂和摸头，也会在你从锁屏回来时随机伸懒腰或被惊醒。

> 本项目是社区二创，不隶属于、也不代表 DeepSeek 官方。仓库中的角色立绘来自项目发起者提供的创作素材；如需公开分发，请确认你拥有对应素材的使用与再授权权利。

## 功能

- 透明、无边框、置顶桌宠窗口与系统托盘
- 点击、双击、拖拽、鼠标悬停和键盘操作反馈
- 右键菜单：聊天、投喂、摸头、置顶、设置、隐藏、退出
- 生理时钟：清晨、专注、午饭、下午、晚间、睡眠七段状态
- 随机闲置彩蛋与多组 CSS 动画
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
| 单击 | 触发点击台词和爱心粒子 |
| 双击 | 打开聊天面板 |
| 按住拖动 | 移动桌宠，松手后给出拖拽反馈 |
| 右键 | 打开桌宠菜单与设置入口 |
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

- `npm test`：测试生理时钟边界与聊天请求构造
- `npm run check`：检查关键文件存在且所有脚本语法有效
- `npm run pack`：生成未安装目录，用于快速验证 Electron 打包
- `npm run dist`：生成 NSIS 安装包和便携版

打包产物位于 `dist/`。

## 项目结构

```text
deepfish-desktop-pet/
├─ assets/                 # 可替换角色素材
├─ scripts/                # 静态检查脚本
├─ src/
│  ├─ main/                # 窗口、托盘、系统事件、模型请求、设置存储
│  ├─ renderer/            # 桌宠、聊天与设置界面
│  ├─ shared/              # 可独立测试的生理时钟逻辑
│  └─ preload.cjs          # 最小化 IPC 桥接
└─ test/                   # Node.js 内置测试
```

## 更换角色素材

将带透明通道的 PNG 替换为 `assets/character.png` 即可。建议人物完整居中、四周保留少量透明边距，长宽比接近 4:5。当前动作通过整体形变实现；后续可在不改变主进程协议的情况下替换为 Live2D、Spine 或逐帧精灵图渲染器。

## 隐私与安全

- Electron 渲染进程启用 `contextIsolation` 和沙箱，关闭 Node.js 集成。
- 自定义 API 地址必须使用 HTTPS。
- 模型请求由主进程发起，API Key 不暴露给页面脚本。
- 设置保存在 Electron `userData` 目录，Key 字段为系统加密密文。
- 公共免费模型的请求会离开本机，请先阅读服务提供方条款。

## 路线图

- Live2D / Spine 分层动画与表情切换
- 音效包和语音合成
- 番茄钟、待办提醒和日历彩蛋
- 多显示器边缘吸附与桌面漫步
- 自动更新与签名安装包

## 许可

源代码使用 [MIT License](./LICENSE)。角色立绘不因源代码许可自动获得再授权；公开发布前请单独确认素材权利。
