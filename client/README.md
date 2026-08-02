# DTBox Client

DTBox 桌面客户端，基于 Tauri 2 构建，负责用户登录和本地凭证管理。用户一次登录后，Web 端无需重复输入密码即可同步认证状态。

## 核心功能

- **用户登录**：通过 Tauri 原生 HTTP（Rust 侧 `reqwest`）调用 Server API，无浏览器跨域限制
- **凭证安全存储**：使用 keyring-rs 将 RefreshToken 和用户 ID 存入系统密钥库
- **短 Token 内存管理**：AccessToken 仅存内存，短期有效，不落盘
- **本地 WebSocket 服务**：启用随机端口，供 Web 端连接以接收刷新的 AccessToken
- **Token 自动刷新**：定时通过 HTTP 调用 Server 刷新 AccessToken，并通过 WebSocket 推送给 Web 端
- **一键打开 Web 端**：调用 Tauri opener 插件打开远程 Web 页面，URL 仅携带 WebSocket 端口，不传输 Token

## 认证流程详解

```
┌──────────┐      POST /api/user/login       ┌──────────┐
│  用户     │ ──  username + password ───────►│  Server  │
│  (GUI)   │◄── access_token + refresh_token │          │
└────┬─────┘       + user_id                 └──────────┘
     │
     │ refresh_token + user_id → 存入 keyring-rs（系统密钥库）
     │ access_token → 存内存
     │
     │ 启动 WebSocket 服务 → 绑定 127.0.0.1:<随机端口>
     │
     │ Tauri opener 打开 Web 页面：
     │ https://web.app/open?ws_port=<port>
     │ （URL 不携带 AccessToken）
     │
     ▼
┌──────────┐      WebSocket (localhost)      ┌──────────┐
│   Web    │── 连接 ws://localhost:<port> ──►│  Client  │
│  页面     │◄─ Client 主动推送 access_token ─┤          │
└────┬─────┘                                  └────┬─────┘
     │  access_token 过期                          │
     │  通过 WS 请求新 token                        │
     │                                             │ HTTP
     │                                           ┌─▼────────┐
     │           GET /api/user/refresh            │  Server  │
     │           (Refresh-Token header)         └──────────┘
     │                                             │
     │◄──── 新 access_token 通过 WS 推送 ──────────┘
```

## 安全设计

| 原则 | 实现 |
|------|------|
| **长 Token 不外传** | RefreshToken 仅存于 keyring-rs，只通过 HTTP 发送 Refresh-Token Header 到 Server，不传输到 Web 端 |
| **短 Token 不经 URL** | AccessToken 不通过 URL 参数传递，仅在 WebSocket 握手后由 Client 主动推送，防止浏览器历史/日志/Referer 泄漏 |
| **短 Token 动态刷新** | AccessToken 短期有效，过期后由 Client 自动刷新并推送 |
| **随机 WebSocket 端口** | 每次启动 Random port，降低端口劫持风险 |
| **本地 WebSocket 绑定** | WebSocket 仅监听 127.0.0.1，不暴露到外网 |
| **系统密钥库存储** | 依赖操作系统 Keychain/macOS、keyutils/Linux、Windows Credential Manager |

## UI 统一

Client（Tauri 窗口）和 Web 端共享统一的设计体系：

- **同一组件库**：shadcn/ui，确保两端交互组件视觉一致
- **同一样式系统**：Tailwind CSS，确保颜色、间距、字体等设计令牌一致
- **交互模式统一**：表单校验、按钮状态、错误提示等行为保持一致
- **类型定义共享**：Rust 端通过 `shared` crate 定义类型，Web 端有对应的 TypeScript 类型定义，保证数据结构一致性

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Tauri 2 |
| 前端 UI | React 19 + TypeScript |
| 构建工具 | Vite |
| Rust 后端 | tauri, keyring-rs, reqwest, tokio-tungstenite |
| HTTP 通信 | Tauri 原生 HTTP（Rust reqwest），无跨域限制 |
| 样式 | Tailwind CSS |

## 目录结构

```
client/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/                   # React 前端代码
│   ├── main.tsx
│   ├── App.tsx
│   └── App.css
└── src-tauri/             # Tauri Rust 后端
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── build.rs
    ├── capabilities/
    │   └── default.json
    ├── icons/             # 应用图标
    └── src/
        ├── main.rs        # Tauri 入口
        └── lib.rs         # Tauri 命令、WebSocket、keyring 逻辑
```

## 前置依赖

- [Rust](https://www.rust-lang.org/)（stable）
- [Bun](https://bun.sh/) 或 Node.js
- [Tauri 系统依赖](https://v2.tauri.app/start/prerequisites/)

## 开发

```bash
cd client
bun install
cargo tauri dev
```

## 构建

```bash
cargo tauri build
```
