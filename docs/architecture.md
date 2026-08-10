# 架构设计

DTBox 是一个三层架构的桌面端美股工具，由三个独立组件构成。

## 架构图

```
┌──────────────────────┐     HTTP      ┌──────────────────────┐
│   Client (Tauri)     │◄─────────────►│   Server (Axum)      │
│                      │   登录 / 业务   │                      │
│  ┌────────────────┐  │               │  ┌────────────────┐  │
│  │  keyring-rs    │  │               │  │  REST API      │  │
│  │  (系统密钥库)   │  │               │  │  JWT Auth      │  │
│  └────────────────┘  │               │  │  SQLite + Redis│  │
│                      │               │  └────────────────┘  │
│  ┌────────────────┐  │               └──────────────────────┘
│  │  WebSocket     │  │                         ▲
│  │  Server        │◄─┤─── WebSocket ───────────┘
│  │  (127.0.0.1)   │  │   Token 管理   ┌──────────────────────┐
│  └────────────────┘  │               │   Web (SPA)          │
└──────────────────────┘               │                      │
                                       │   React 19 + Vite    │
                                       │   shadcn/ui          │
                                       └──────────────────────┘
```

## 三层职责

### Client（桌面端）

Tauri 2 构建的原生桌面应用，负责：

- 用户登录 / 注册（直接 HTTP 调用 Server）
- RefreshToken 安全存储（系统密钥库）
- AccessToken 内存管理
- 本地 WebSocket 服务（127.0.0.1 随机端口）
- Token 刷新中转（接收 Web 端请求 → 调用 Server → 推送新 Token）
- TimeTool 悬浮窗口（Akamai 时间戳 + 美国经济数据）

### Server（后端 API）

Axum 构建的 REST API 服务，负责：

- 用户认证（JWT 签发与校验）
- 角色权限管理（User / Subscriber / Admin）
- 业务数据接口（股票搜索、K 线图、Finviz、Alpaca、Benzinga）
- 限流与黑名单（Redis/内存）
- 生产环境同时 Serve 前端静态文件

### Web（前端页面）

React 19 + Vite SPA，由桌面端 `opener` 打开：

- API 调试工具（可构造和发送所有 API 请求）
- 通过本地 WebSocket 获取和刷新 AccessToken
- 直接调用 Server API（Bearer 认证）

## 认证协议

```
┌──────────┐               ┌──────────┐               ┌──────────┐
│  Client   │   HTTP        │  Server  │               │   Web    │
│  (Tauri)  │◄─────────────►│  (Axum)  │               │  (SPA)   │
└────┬─────┘               └──────────┘               └────┬─────┘
     │                                                     │
     │ ① POST /api/user/login (username + password)       │
     │◄─ access_token + refresh_token + user_id ──────────│
     │                                                     │
     │ refresh_token → keyring-rs (系统密钥库)             │
     │ access_token  → 内存                                │
     │                                                     │
     │ ② 启动本地 WebSocket Server (127.0.0.1:random_port) │
     │                                                     │
     │ ③ 打开 Web: /open?ws_port=<random_port>             │
     │                                                     │
     │ ④                  WebSocket 握手 ─────────────────►│
     │◄─ push access_token ──────────────────────────────│
     │                                                     │
     │                                   ⑤ 调用 Server API│
     │                                   携带 Bearer token │
     │                                                     │
     │                             ⑥ Token 过期 ─────────►│
     │◄─ WebSocket: { type: "refresh" } ──────────────────│
     │                                                     │
     │ ⑦ POST /api/user/refresh (Refresh-Token header)    │
     │◄─ new access_token  ──────────────────────────────│
     │                                                     │
     │ ⑧ push new access_token ──────────────────────────►│
```

## 数据流

| 数据 | 存储位置 | 生命周期 | 传输范围 |
|------|----------|----------|----------|
| RefreshToken | 系统密钥库 (keyring-rs) | 7 天 | 仅 Client → Server |
| AccessToken | 内存 (Client + Web) | 10 分钟 | Client ↔ Web (WS) / Web → Server (HTTP) |
| 用户密码 | 不存储 | 单次登录 | 仅 Client → Server |

## 技术栈

| 组件 | 语言 / 框架 | 关键依赖 |
|------|-------------|----------|
| Client 原生 | Rust (Tauri 2) | keyring-rs, reqwest, tokio-tungstenite |
| Client UI | React 19 + TypeScript | Vite, shadcn/ui |
| Server | Rust (Axum 0.8) | SeaORM 2, jsonwebtoken, argon2, Redis |
| Server 数据库 | SQLite | sea-orm sqlx-sqlite |
| Web 前端 | React 19 + TypeScript | Vite, Tailwind CSS v4, shadcn/ui |
| 共享类型 | Rust (shared crate) | serde, chrono |
