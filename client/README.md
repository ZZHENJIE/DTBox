# DTBox Client

DTBox 桌面客户端，基于 Tauri 2 构建的**纯认证外壳**。Client 自身不承载业务 UI，只负责用户认证、本地凭证管理与 Web 应用加载。

## 实现状态 vs 目标态

| 功能 | 状态 | 说明 |
|------|------|------|
| 登录 / 注册（`do_login` / `do_register`） | ✅ 已实现 | `auth.rs` 调用 Server API，凭证入 keyring / 内存 |
| 登出（`do_logout`） | ✅ 已实现 | 撤销 Token 并清除本地凭证 |
| Server 地址读写（`set_server_url` / `get_server_url`） | ✅ 已实现 | 前端持久化到 localStorage，`set_server_url` 同步到 Rust 内存 |
| 测试连接按钮（`GET /api/health`） | ✅ 已实现 | `test_connection` 命令验证后端连通性 |
| Token IPC（`get_access_token` / `refresh_access_token` / `get_user_id`） | ✅ 已实现 | 注册到 `invoke_handler` |
| 打开 Web 子窗口（`open_web`） | ✅ 已实现 | 由 Rust `WebviewWindowBuilder` 运行时创建 |
| 免密自动登录（`auto_login`） | ✅ 已实现 | 启动时读 keyring → 刷新 Token → 打开 Web 子窗口 |
| HTTP 自动刷新（`api.rs`） | ⚠️ 预留 | `get_with_auth` / `post_with_auth` 已实现，暂无业务命令调用 |

## 窗口结构

Client 设计为两个窗口：

| 窗口 | 内容 | 职责 |
|------|------|------|
| **主窗口** | 设置服务器页面 | 配置 Server 地址（Host/Port），触发免密登录，打开 Web 子窗口 |
| **Web 子窗口** | DTBox Web SPA | 承载全部业务 UI（登录/注册/Dashboard/图表等），通过 Tauri IPC 调用 Client |

> **说明**：`tauri.conf.json` 只声明 `main` 主窗口。Web 子窗口由 Rust 侧在运行时通过 `WebviewWindowBuilder` 动态创建（对应 `open_web` 命令），无需在配置文件中预先定义。

```
┌────────────────────────────────────────────────────────┐
│ Client (Tauri 主进程)                                  │
│                                                        │
│  ┌────────────────────┐    另开子窗口   ┌─────────────┐ │
│  │ 主窗口              │ ─────────────► │ 子窗口       │ │
│  │ 设置服务器页面      │                │ Web SPA     │ │
│  └─────────┬──────────┘                └──────┬──────┘ │
│            │  invoke(set_server_url)          │         │
│            │  invoke(open_web)                │ invoke  │
│            │                                  │         │
│  ┌─────────▼──────────────────────────────────▼──────┐ │
│  │ Rust 后端: keyring-rs(refresh) · 内存(access)     │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 核心功能

- **用户注册 / 登录**：通过 Rust 侧 `reqwest` 调用 Server API，由 Web 子窗口经 IPC 触发
- **免密自动登录**：RefreshToken 存入系统密钥库，下次启动时自动刷新 AccessToken，无需重新输入密码
- **凭证安全存储**：keyring-rs 存 RefreshToken（系统密钥库），AccessToken 仅存内存
- **Tauri IPC 令牌服务**：Web 子窗口通过 `invoke` 获取/刷新 AccessToken，无需 WebSocket、不暴露网络端口
- **服务器地址配置**：主窗口设置 Server 地址并持久化到 localStorage，提供测试连接（`GET /api/health`）与打开 Web 子窗口

## 认证流程

### 登录 / 注册

```
Web 子窗口                Client (Rust)                 Server
    │  invoke("do_login")    │                            │
    │  name + password       │  POST /api/user/login      │
    │───────────────────────►│───────────────────────────►│
    │                        │◄── access_token             │
    │                        │     refresh_token           │
    │                        │     user_id                 │
    │                        │                            │
    │                        │ refresh_token → keyring-rs  │
    │                        │ user_id/username → keyring  │
    │                        │ access_token → 内存         │
    │◄─── user_id ───────────│                            │
```

### 免密登录

```
应用启动
  │
  ├─ 主窗口加载，读取 localStorage 中的 Server 配置
  │
  ├─ invoke("auto_login")
  │     │
  │     ├─ 从 keyring 读取 last_user_id
  │     │     ├─ 存在 → 读 RefreshToken → 调 Server 刷新 AccessToken
  │     │     │           ├─ 成功 → 更新内存 Token，返回 true
  │     │     │           └─ 失败 → 返回 false
  │     │     └─ 不存在 → 返回 false
  │     │
  │     └─ invoke("open_web") 打开 Web 子窗口
  │           ├─ 已登录 → 直接进入 Dashboard
  │           └─ 未登录 → 进入登录页
```

## Tauri IPC 命令契约

Web 子窗口通过 `@tauri-apps/api` 的 `invoke` 调用以下命令。

| 命令 | 参数 | 返回 | 调用方 | 说明 |
|------|------|------|--------|------|
| `do_login` | `name`, `password` | `user_id` (String) | Web 子窗口 | 登录，存 RefreshToken 到 keyring，AccessToken 到内存 |
| `do_register` | `name`, `password` | `user_id` (String) | Web 子窗口 | 注册新用户 |
| `do_logout` | - | `()` | Web 子窗口 | 登出，撤销 Token 并清除凭证 |
| `get_access_token` | - | `access_token` (String) | Web 子窗口 | 返回当前 AccessToken |
| `refresh_access_token` | - | `access_token` (String) | Web 子窗口 | 用 keyring 中的 RefreshToken 刷新 |
| `get_user_id` | - | `user_id` (String) | Web 子窗口 | 返回当前用户 ID |
| `get_user_info` | - | `{ user_id, username }` | 主窗口 | 返回当前用户基本信息 |
| `set_server_url` | `url` | `()` | 主窗口 | 设置 Server 地址（前端同步持久化到 localStorage） |
| `get_server_url` | - | `url` (String) | 主窗口 | 读取 Server 地址 |
| `test_connection` | `url?` | `version` (String) | 主窗口 | 调用 `GET /api/health` 测试连通性并返回服务端版本 |
| `open_web` | - | `()` | 主窗口 | 打开 Web 子窗口 |
| `auto_login` | - | `ok` (bool) | 主窗口 | 用 keyring 中的 RefreshToken 尝试免密登录 |

> **类型说明**：`user_id` 在 Rust 内部为 `i32`（见 `state.rs` / `vault.rs`），命令通过字符串形式返回给前端。

## 认证事件

Rust 侧在认证状态变化时通过 `app.emit` 广播 `auth-state` 事件（载荷 `{ user_id, username }`）。主窗口监听该事件以在登录/登出时切换界面：

- `do_login` 成功后 → 广播已登录用户
- `do_logout` 成功后 → 广播 `{ user_id: null, username: null }`

```ts
import { listen } from "@tauri-apps/api/event";

await listen("auth-state", (event) => {
  const { user_id, username } = event.payload;
  // 根据 user_id 是否为空切换主窗口视图
});
```

### 调用示例

```ts
import { invoke } from "@tauri-apps/api/core";

// 登录
const userId = await invoke<string>("do_login", { name: "alice", password: "secret" });
```

## 后端接口

Client 通过 HTTP 调用 Server 的以下接口（`auth.rs` 中实现）：

| Client 动作 | HTTP 端点 |
|-------------|-----------|
| 登录 | `POST /api/user/login` |
| 注册 | `POST /api/user/create` |
| 刷新 AccessToken | `GET /api/user/refresh` |
| 登出 | `POST /api/user/logout` |

完整后端 API 参考与请求/响应类型定义见 [../server/README.md](../server/README.md)。

## AccessToken 自动刷新机制

`api.rs` 模块提供 `get_with_auth` / `post_with_auth` 封装，所有经其发出的请求在首次失败时自动刷新并重试（当前预留，尚无命令调用）：

```
HTTP 请求
  ├─ 带当前 AccessToken (Bearer) 发送
  ├─ 成功 → 返回数据
  └─ 失败 →
       ├─ 从 keyring 加载 RefreshToken
       ├─ 调用 GET /api/user/refresh
       ├─ 更新 state.access_token
       └─ 用新 Token 重试请求
```

## 安全设计

| 原则 | 实现 |
|------|------|
| **长 Token 不外传** | RefreshToken 仅存于 keyring-rs，只通过 HTTP 发送 Refresh-Token Header 到 Server，不传输到 Web 端 |
| **短 Token 不经 URL** | AccessToken 仅通过 Tauri IPC (`invoke`) 传递，不出现于 URL、localStorage、cookie |
| **IPC 进程内通信** | Token 传递走 Tauri 进程内 IPC，无需暴露任何网络端口 |
| **系统密钥库存储** | 依赖操作系统 Keychain/macOS、keyutils/Linux、Windows Credential Manager |

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Tauri 2 |
| 主窗口 UI | React 19 + TypeScript（设置服务器页面） |
| 构建工具 | Vite |
| Rust 后端 | tauri, tauri-plugin-http, tauri-plugin-opener, keyring-rs, reqwest, shared |

## Capabilities 权限

Tauri 权限声明位于 `src-tauri/capabilities/`：

- **`default.json`**：对 `main` 主窗口授权，启用 `core:default`、`opener:default`、`http:default`（HTTP 插件仅允许 `http://*`）
- **`remote.json`**：对 `web` 子窗口授权 `core:default`，并声明 `remote.urls`（`http://*` / `https://*`），使远程 Web SPA 能通过 IPC 调用 Client 命令

## 目录结构

```
client/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/                   # 主窗口（设置服务器页面）
│   ├── main.tsx
│   └── index.css
└── src-tauri/             # Tauri Rust 后端
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── build.rs
    ├── capabilities/
    │   ├── default.json   # 主窗口权限
    │   └── remote.json    # 远程 Web 子窗口 IPC 权限
    ├── icons/             # 应用图标
    └── src/
        ├── main.rs        # Tauri 入口
        ├── lib.rs         # Tauri 命令注册（IPC 契约）
        ├── api.rs         # HTTP API 封装（带 Token 自动刷新，当前预留）
        ├── auth.rs        # 登录、注册、Token 刷新、登出、健康检查
        ├── vault.rs       # keyring 凭证存储（token + user_id + username）
        └── state.rs       # 应用状态管理
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
