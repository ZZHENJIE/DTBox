# Upwork Profile — DTBox

> 基于 DTBox 项目提炼，可直接粘贴到 Upwork Profile。Title 采用 B 方案（全栈），保留中英对照。

---

## Title (Upwork 标题，搜索权重最高)

```
Full-Stack Rust & React | Tauri Desktop + Axum API | JWT/Security
```

---

## Overview (英文主版，约 1000 字符)

```
Rust Full-Stack Developer — Axum · Tauri 2 · React 19

I build secure, production-grade desktop + web products in Rust.

My flagship project DTBox is a US stock desktop tool with a 3-layer architecture: Tauri 2 shell (Rust) + Axum REST API (Rust/Tokio) + React 19 SPA (TypeScript/Vite/Tailwind).

What I can do for you:

Backend (Rust/Axum) — Axum 0.8 + Tokio, SeaORM 2 + SQLite, JWT dual-token auth (10m access / 7d refresh), Argon2 hashing, Redis blacklist, 4-level RBAC (User/Subscriber/Admin/Refresh), IP sliding-window rate limiting (5/60s login, 100/60s global), Tower middleware, unified ApiResponse<T>. 14+ endpoints across 7 route groups.

Desktop (Tauri 2) — Pure auth shell with 13 IPC commands, dual-window (settings + external WebView), system keyring storage (macOS Keychain / Linux keyutils / Win Credential Manager), auto-login via RefreshToken, never exposing long tokens to the web layer. Token passed via Tauri IPC only, with 401 auto-refresh.

Frontend (React 19) — TypeScript 6, Vite 8, Tailwind v4 + shadcn/ui, React Router 7 guards, Context auth, singleton token cache with deduped refresh, lightweight-charts, i18n (en/zh).

Architecture highlight: Long token never leaves the OS keystore; short JWT travels only via IPC/Bearer; logout revokes via Redis TTL. Cargo Workspace with shared types for end-to-end type safety.

Available for: Rust backend APIs, Tauri desktop apps, secure auth systems, React frontends. Clean code, unsafe_code = deny, documented & deployable (Nginx/Caddy, GitHub Actions).

Let's build your product — message me with your spec.
```

## Overview 精简版 (500 字符，移动端/预览用)

```
Full-Stack Rust & React | DTBox — Tauri 2 + Axum + React 19

Secure US stock desktop app: Tauri auth shell + Axum API (14 endpoints, RBAC, JWT dual-token, Argon2, Redis, rate limiting) + React 19 SPA. Keyring-isolated RefreshToken, IPC bridge, 401 auto-refresh, Cargo Workspace. Available for Rust APIs, Tauri desktops & secure auth.
```

---

## 中文对照

```
全栈 Rust & React 开发者 | Tauri 桌面 + Axum 后端 + JWT 安全

代表项目 DTBox：三端美股桌面工具，Tauri 2 外壳 (Rust) + Axum REST API (Rust/Tokio) + React 19 SPA (TypeScript/Vite/Tailwind)。

精通：Rust / Axum 0.8 / Tokio / Tauri 2 / JWT 双令牌 (10分钟 Access / 7天 Refresh) / Argon2 / SeaORM 2 / 系统密钥库 (keyring)
熟练：React 19 + TypeScript 6 + Vite 8 + Tailwind v4 + shadcn/ui / React Router 7 / REST API 设计 / SQLite / Redis / Tower 限流 / RBAC 四级鉴权
了解：Plotters K线渲染 / Alpaca/Finviz/Benzinga 三方行情聚合 / i18n / lightweight-charts

架构亮点：长 Token 永不离开本地 keyring（仅 Client→Server），短 JWT 经 Tauri IPC 与 Bearer 传递，登出写入 Redis 黑名单（TTL=剩余有效期），实现一次登录双端同步与开机免密登录。Cargo Workspace 共享类型，前后端类型一致。

可承接：Rust 后端 API、Tauri 桌面应用、安全认证系统、React 前端。代码规范 unsafe_code = deny，支持 Nginx/Caddy 反向代理与 GitHub Actions 全平台打包。
```

---

## Skills 标签 (Upwork 最多 15 个)

```
Rust, Axum, Tokio, Tauri, React, TypeScript, Vite, Tailwind CSS, JWT, SeaORM, SQLite, Redis, REST API, Desktop Application, Authentication
```

---

## Project Catalog — DTBox 单项

**Title:**
```
DTBox — Secure US Stock Desktop App (Tauri + Axum + React)
```

**Description:**
```
3-layer architecture: Tauri 2 auth shell + Axum API (14 endpoints, RBAC, rate limiting, JWT+Redis) + React 19 SPA. Keyring-isolated RefreshToken, IPC token bridge, 401 auto-refresh, Plotters K-line PNG, Alpaca/Finviz/Benzinga integration. Cargo Workspace, 7.8k LOC, unsafe_code = deny.
```

**Tags:**
`Rust` `Tauri` `Axum` `React` `JWT`

---

## 使用说明

1. Upwork Profile → Title 粘贴英文 Title
2. Overview 粘贴英文主版（精简版用于 Proposal 封面）
3. Skills 逐个添加（按顺序，命中搜索）
4. 中文对照保留本地备查，或用于中文客户沟通
5. 面试话术准备：为什么 RefreshToken 用随机 UUID+SHA256 而非 JWT？IPC 相比 localStorage 有何安全优势？

> 证据链：`server/src/util/jwt.rs:13` `server/src/service/auth.rs:9` `client/src-tauri/src/vault.rs:7` `client/src-tauri/src/lib.rs:31` `web/src/lib/api.ts:18` `server/src/middleware/auth.rs:14` `server/src/middleware/rate_limit.rs:23`
