# 架构设计

DTBox 是一个三层架构的桌面端美股工具，由三个独立组件构成。

## 架构图

```
┌───────────────────────────────────────────────────────────────┐
│ Client (Tauri) — 纯认证外壳                                    │
│                                                               │
│  ┌──────────────┐   ┌─────────────┐   ┌────────────────────┐  │
│  │ 主窗口 main   │   │ 子窗口 web   │   │ 子窗口 time_window  │  │
│  │ 设置/已登录页 │   │ Web SPA     │   │ /tools/timewindow  │  │
│  │ (localStorage)│   │             │   │ always_on_top      │  │
│  └──────┬───────┘   └──────┬──────┘   └─────────┬──────────┘  │
│         │ invoke(...)      │ invoke(...)         │            │
│  ┌──────▼──────────────────▼─────────────────────▼──────────┐  │
│  │ Rust 后端: keyring-rs(refresh) · 内存(access) · opener    │  │
│  │ window-state(位置/大小记忆) · http · shared               │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────┬────────────────────────────────────────────────┘
                │ HTTP (登录 / Token 刷新 / health / me)
       ┌────────▼────────┐     HTTP     ┌────────────┐
       │ Server (Axum)   │◄─────────────│ Web 子窗口  │
       │ REST API + 静态 │  业务 API     │ (Bearer)   │
       └─────────────────┘              └────────────┘
```

## 三层职责

### Client（桌面端 — 纯认证外壳）

Tauri 2 构建的原生桌面应用，不承载业务 UI，负责：

- 主窗口：设置服务器页面（配置 Server 地址、测试连接、触发免密登录、打开子窗口、展示用户信息）
- TimeWindow 子窗口：置顶悬浮工具窗口（`/tools/timewindow`，`always_on_top`）
- 用户登录 / 注册（由 Web 经 IPC 触发，Client 直接 HTTP 调用 Server）
- RefreshToken 安全存储（系统密钥库）+ 用户信息（用户名/头像经 `GET /api/user/me`）
- AccessToken 内存管理 + `get_with_auth` 自动刷新
- 窗口状态记忆（`tauri-plugin-window-state`，启动恢复/退出保存）
- Tauri IPC 命令：13 条（`do_login`/`do_register`/`do_logout`/`get_access_token`/`refresh_access_token`/`get_user_id`/`get_user_info`/`set_server_url`/`get_server_url`/`test_connection`/`open_web`/`open_time_window`/`open_url`），含 `opener` 外部 URL 打开

### Server（后端 API）

Axum 构建的 REST API 服务，负责：

- 用户认证（JWT 签发与校验）
- 角色权限管理（User / Subscriber / Admin）
- 业务数据接口（股票搜索、K 线图、Finviz、Alpaca、Benzinga）
- 限流与黑名单（Redis/内存）
- 生产环境同时 Serve 前端静态文件（`web/dist`）

### Web（前端页面 — 完整 SPA）

React 19 + Vite SPA，仅在 Tauri 子窗口内运行：

- 全部业务 UI（`/login` 登录/注册、`/screener` 筛选器、`/quote?symbol=` 报价、`/calendar/:type` 财经日历、` /settings` 设置、`/admin` 管理、`/tools/timewindow` 悬浮时钟、` /tools/test` 测试页）
- 通过 Tauri IPC (`invoke`) 获取和刷新 AccessToken
- 直接调用 Server API（Bearer 认证），同源 `/api/xxx`（Vite proxy / Server ServeDir）
- 国际化（`i18n` en-US/zh-CN，`LanguageSync` 同步 `settings.language` 与 `localStorage`）

## 认证协议

```
┌──────────┐               ┌──────────┐               ┌──────────┐
│  Client   │   HTTP        │  Server  │               │   Web    │
│  (Tauri)  │◄─────────────►│  (Axum)  │               │  (SPA)   │
└────┬─────┘               └──────────┘               └────┬─────┘
     │                                                     │
     │ ① Web invoke("do_login", name+password)            │
     │◄────────────────────────────────────────────────────│
     │                                                     │
     │ ② POST /api/user/login (username + password)       │
     │◄─ access_token + refresh_token + user_id ──────────│
     │                                                     │
     │ refresh_token → keyring-rs (系统密钥库)             │
     │ access_token  → 内存                                │
     │                                                     │
     │ ③ 返回 user_id 给 Web                               │
     │                                                     │
     │ ④ Web invoke("get_access_token") ─────────────────►│
     │◄─ access_token ─────────────────────────────────────│
     │                                                     │
     │                                   ⑤ 调用 Server API│
     │                                   携带 Bearer token │
     │                                                     │
     │                             ⑥ Token 过期 ─────────►│
     │◄─ invoke("refresh_access_token") ───────────────────│
     │                                                     │
     │ ⑦ GET /api/user/refresh (Refresh-Token header)     │
     │◄─ new access_token  ──────────────────────────────│
     │                                                     │
     │ ⑧ 返回 new access_token ──────────────────────────►│
```

## 数据流

| 数据 | 存储位置 | 生命周期 | 传输范围 |
|------|----------|----------|----------|
| RefreshToken | 系统密钥库 (keyring-rs) | 7 天 | 仅 Client → Server |
| AccessToken | 内存 (Client) | 10 分钟 | Client ↔ Web (IPC) / Web → Server (HTTP) |
| 用户密码 | 不存储 | 单次登录 | 仅 Client → Server |

## 技术栈

| 组件 | 语言 / 框架 | 关键依赖 |
|------|-------------|----------|
| Client 原生 | Rust (Tauri 2) | keyring-rs, reqwest, opener, window-state, shared |
| Client 主窗口 | React 19 + TypeScript | Vite |
| Server | Rust (Axum 0.8) | SeaORM 2, jsonwebtoken, argon2, Redis, plotters |
| Server 数据库 | SQLite | sea-orm sqlx-sqlite |
| Web 前端 | React 19 + TypeScript | Vite, Tailwind CSS v4, shadcn/ui, react-router-dom, lightweight-charts, i18next |
| 共享类型 | Rust (shared crate) | serde, chrono |
