# DTBox

基于 Tauri 的桌面端美股工具，组合 Tauri 桌面客户端 + Axum 后端 API + Web 前端页面。

## 设计目标

- **一次登录，双重体验**：桌面端登录后，Web 端无需重复输入密码即可同步认证状态
- **长 Token 不离开本地**：RefreshToken 存储于系统密钥库（keyring-rs），仅在桌面端使用，永远不通过网络传输
- **短 Token 动态传递**：AccessToken 短期有效，通过 WebSocket 从桌面端推送至 Web 端，自动刷新

## 整体认证流程

```
1. 用户在 Client（桌面端）输入账号密码，通过 HTTP 登录 Server
2. Client 获得 AccessToken + RefreshToken + UserID
3. RefreshToken + UserID → 存入本地 keyring-rs（系统密钥库）
4. AccessToken → 存内存（短期有效）
5. Client 启动本地 WebSocket 服务（随机端口）
6. Client 通过 Tauri opener 打开 Web 页面：
   https://web.app/open?ws_port=<port>
   （URL 不携带 AccessToken，仅传递 WebSocket 端口）
7. Web 端连接 Client 的 WebSocket，握手成功后 Client 主动推送当前 AccessToken
8. Web 端用 AccessToken 调用 Server API（Bearer 认证）
9. AccessToken 过期时，Web 通过 WebSocket 请求 Client 刷新
10. Client 用 RefreshToken 调用 Server 刷新 AccessToken → 通过 WebSocket 推送给 Web 端
```

## 架构概览

```
┌──────────────────┐     HTTP      ┌──────────────────┐
│   Client (Tauri) │◄─────────────►│  Server (Axum)   │
│                  │   登录/业务     │                  │
│  ┌────────────┐  │               │  ┌────────────┐  │
│  │  keyring   │  │               │  │  REST API   │  │
│  │  (本地存储)  │  │               │  │  JWT Auth   │  │
│  └────────────┘  │               │  │  SQLite DB  │  │
│                  │               │  └────────────┘  │
│  ┌────────────┐  │               └──────────────────┘
│  │ WebSocket   │  │                        ▲
│  │ Server      │◄─┤─── WebSocket ──────────┘
│  │ (随机端口)   │  │   Token 管理  ┌──────────────────┐
│  └────────────┘  │               │  Web (spa)      │
└──────────────────┘               │                  │
                                   │  /open?ws_port=  │
                                   │  (唯一入口)       │
                                   └──────────────────┘
```

## 组件关系

| 通信链路 | 协议 | 用途 |
|---------|------|------|
| Client → Server | HTTP | 登录、登出、用户操作、Token 刷新 |
| Web → Server | HTTP | API 调用，携带 AccessToken |
| Web ↔ Client | WebSocket (本地) | AccessToken 刷新推送 |

## 目录结构

```
DTBox/
├── client/              # Tauri 桌面客户端（React + TypeScript）
│   └── src-tauri/       # Tauri Rust 后端（keyring、WebSocket）
├── server/              # Axum 后端 API 服务
│   ├── src/
│   │   ├── handler/     # 路由处理
│   │   ├── middleware/  # 认证、限流
│   │   ├── service/     # 业务逻辑
│   │   ├── entity/      # SeaORM 实体
│   │   ├── config/      # 配置加载
│   │   └── util/        # JWT、密码哈希
│   └── web/             # Web 前端页面（React + Vite）
│       └── src/
│           ├── components/  # shadcn/ui 组件
│           ├── lib/         # API 客户端、端点定义
│           └── types/       # TypeScript 类型定义
└── shared/              # Rust 共享类型定义（Client & Server）
```

## 快速开始

### 启动 Server

```bash
cd server
cp config.example.toml config.toml
# 编辑 config.toml 配置 jwt.secret 等参数
cargo run
```

或在 workspace 根目录：

```bash
cargo run --package Server
```

### 启动 Client（Tauri 桌面端）

```bash
cd client
bun install
cargo tauri dev
```

### 启动 Web 前端开发

```bash
cd server/web
bun install
bun run dev
```

## 许可证

[GNU GPL v3](LICENSE)
