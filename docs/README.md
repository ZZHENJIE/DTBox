# DTBox

基于 Tauri 的桌面端美股工具，组合 Tauri 桌面客户端 + Axum 后端 API + Web 前端页面。

## 设计目标

- **一次登录，双重体验**：桌面端代理认证后，Web 端无需重复输入密码即可同步认证状态
- **长 Token 不离开本地**：RefreshToken 存储于系统密钥库（keyring-rs），仅在桌面端使用，永远不通过网络传输
- **短 Token 动态传递**：AccessToken 短期有效，通过 Tauri IPC (`invoke`) 在 Client 与 Web 间传递，自动刷新

## 整体认证流程

```
1. Client（桌面端）主窗口配置 Server 地址，打开 Web 子窗口
2. Web 子窗口显示登录/注册页，通过 IPC 调用 Client 完成登录
3. Client 通过 HTTP 登录 Server，获得 AccessToken + RefreshToken + UserID
4. RefreshToken + UserID → 存入本地 keyring-rs（系统密钥库）
5. AccessToken → 存 Client 内存（短期有效）
6. Web 通过 IPC (invoke) 获取 AccessToken
7. Web 端用 AccessToken 调用 Server API（Bearer 认证）
8. AccessToken 过期时，Web 通过 IPC 请求 Client 刷新
9. Client 用 RefreshToken 调用 Server 刷新 AccessToken → Web 重新获取
```

## 架构概览

```
┌──────────────────────────────────────────────────┐
│ Client (Tauri) — 纯认证外壳                       │
│                                                  │
│  ┌───────────────┐     另开子窗口  ┌────────────┐ │
│  │ 主窗口         │ ─────────────► │ 子窗口      │ │
│  │ 设置服务器页面  │                │ Web SPA    │ │
│  └───────────────┘                └─────┬──────┘ │
│  ┌───────────────┐                      │        │
│  │ keyring-rs    │   ◄── Tauri IPC ────┘        │
│  │ (RefreshToken)│   (invoke: 登录/Token 获取)   │
│  └───────────────┘                               │
└──────────────┬───────────────────────────────────┘
               │ HTTP (登录 / Token 刷新)
      ┌────────▼────────┐     HTTP     ┌────────────┐
      │ Server (Axum)   │◄─────────────│ Web 子窗口  │
      │ REST API + 静态 │  业务 API     │ (Bearer)   │
      └─────────────────┘              └────────────┘
```

## 组件关系

| 通信链路 | 协议 | 用途 |
|---------|------|------|
| Client → Server | HTTP | 登录、登出、Token 刷新 |
| Web → Server | HTTP | 业务 API 调用，携带 AccessToken |
| Web ↔ Client | Tauri IPC (invoke) | 登录/注册、AccessToken 获取与刷新 |

## 目录结构

```
DTBox/
├── client/              # Tauri 桌面客户端（纯认证外壳）
│   ├── src/             # 主窗口 UI（设置服务器页面）
│   └── src-tauri/       # Tauri Rust 后端（keyring、IPC 命令）
├── server/              # Axum 后端 API 服务
│   ├── src/
│   │   ├── handler/     # 路由处理
│   │   ├── middleware/  # 认证、限流
│   │   ├── service/     # 业务逻辑
│   │   ├── entity/      # SeaORM 实体
│   │   ├── config/      # 配置加载
│   │   └── util/        # JWT、密码哈希
│   └── script/          # 辅助脚本
├── web/                 # Web 前端 SPA（React + Vite）
│   └── src/
│       ├── components/  # 页面组件 + shadcn/ui 组件
│       ├── lib/         # API 客户端、端点定义
│       └── types/       # TypeScript 类型定义
└── shared/              # Rust 共享类型定义（Client & Server）
```

## 快速开始

### 启动 Server

```bash
cd server
cp config.example.toml config.toml
# 编辑 config.toml 配置 jwt.secret 等参数
cargo run -- --config config.toml
```

或在 workspace 根目录：

```bash
cargo run --package Server -- --config server/config.toml
```

配置文件路径必须显式指定（`--config`/`-c` 启动参数，或 `DTBOX_CONFIG_PATH` 环境变量），两者都未提供时启动报错。

### 启动 Web 前端开发

```bash
cd web
bun install
bun run dev
```

### 启动 Client（Tauri 桌面端）

```bash
cd client
bun install
cargo tauri dev
```

## 许可证

[GNU GPL v3](LICENSE)
