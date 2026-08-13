# Client（桌面端）

DTBox 桌面客户端，基于 Tauri 2 构建的**纯认证外壳**，负责用户认证、本地凭证管理与 Web 应用加载，不承载业务 UI。

## 窗口结构

| 窗口 | 内容 | 职责 |
|------|------|------|
| **主窗口** | 设置服务器页面 | 配置 Server 地址、触发免密登录、打开 Web 子窗口 |
| **Web 子窗口** | DTBox Web SPA | 承载全部业务 UI，通过 Tauri IPC 调用 Client |

## 核心功能

- **用户注册 / 登录**：通过 Rust 侧 reqwest 调用 Server API，由 Web 子窗口经 IPC 触发
- **免密自动登录**：RefreshToken 存入系统密钥库，下次启动自动刷新，无需重新输入密码
- **凭证安全存储**：keyring-rs（系统密钥库）+ 内存
- **Tauri IPC 令牌服务**：Web 子窗口通过 `invoke` 获取/刷新 AccessToken，无需 WebSocket
- **服务器地址配置**：主窗口设置并保存 Server 地址

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Tauri 2 |
| 主窗口 UI | React 19 + TypeScript |
| 构建工具 | Vite |
| Rust 原生 | keyring-rs, reqwest, shared |

## Tauri IPC 命令契约

| 命令 | 参数 | 返回 | 调用方 | 说明 |
|------|------|------|--------|------|
| `do_login` | `name`, `password` | `user_id` | Web 子窗口 | 登录，存 RefreshToken 到 keyring |
| `do_register` | `name`, `password` | `user_id` | Web 子窗口 | 注册新用户 |
| `do_logout` | - | `()` | Web 子窗口 | 登出并清除凭证 |
| `get_access_token` | - | `access_token` | Web 子窗口 | 返回当前 AccessToken |
| `refresh_access_token` | - | `access_token` | Web 子窗口 | 刷新 AccessToken |
| `get_user_id` | - | `user_id` | Web 子窗口 | 返回当前用户 ID |
| `set_server_url` | `url` | `()` | 主窗口 | 设置 Server 地址 |
| `get_server_url` | - | `url` | 主窗口 | 读取 Server 地址 |
| `open_web` | - | `()` | 主窗口 | 打开 Web 子窗口 |

## 状态管理

```
┌───────────────┐
│   AppState    │
├───────────────┤
│ server_url    │  Server 地址 (主窗口可配置)
│ access_token  │  当前 AccessToken (仅内存)
│ user_id       │  当前用户 ID
└───────────────┘
```

## 凭证存储

| 数据 | 存储位置 | 说明 |
|------|----------|------|
| RefreshToken | keyring-rs | 系统密钥库，永不离开本地 |
| UserID | keyring-rs | 用于免密自动登录 |
| AccessToken | 内存 | 短期有效，不持久化 |
| Server 配置 | 主窗口设置 | Server 地址 |

## HTTP API 自动刷新

所有通过 `api.rs` 发出的请求，在首次失败时自动刷新并重试：

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

## 目录结构

```
client/
├── index.html
├── package.json
├── vite.config.ts
├── src/                   # 主窗口（设置服务器页面）
│   └── main.tsx
└── src-tauri/             # Tauri Rust 后端
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── capabilities/
    ├── icons/
    └── src/
        ├── main.rs        # Tauri 入口
        ├── lib.rs         # Tauri 命令注册（IPC 契约）
        ├── api.rs         # HTTP API 封装（带 Token 自动刷新）
        ├── auth.rs        # 登录、注册、Token 刷新
        ├── vault.rs       # keyring 凭证存储
        └── state.rs       # 应用状态管理
```

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
