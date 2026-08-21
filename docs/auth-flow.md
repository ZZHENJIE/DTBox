# 认证流程

DTBox 的认证机制分为三层：**密码登录**、**Token 管理**、**免密自动登录**。

## 密码登录流程

```
Web (子窗口)                   Client (Tauri)                   Server (Axum)
    │                              │                                │
    │  invoke("do_login")          │                                │
    │  { name, password }          │                                │
    │─────────────────────────────►│                                │
    │                              │  POST /api/user/login          │
    │                              │  { username, password }        │
    │                              │───────────────────────────────►│
    │                              │                                │
    │                              │                                │ 校验密码
    │                              │                                │ 生成 JWT
    │                              │                                │ 存 RefreshToken
    │                              │                                │ 记登录日志
    │                              │                                │
    │                              │◄─ access_token                 │
    │                              │    refresh_token               │
    │                              │    user_id                     │
    │                              │                                │
    │                              │ refresh_token → keyring-rs     │
    │                              │ user_id → keyring-rs           │
    │                              │ access_token → 内存            │
    │                              │                                │
    │◄── user_id ─────────────────│                                │
```

## Token 设计

### AccessToken（短期令牌）

- 类型：JWT
- 有效期：默认 10 分钟（可配置 `jwt.access_token_expire_minutes`）
- 载荷：`{ sub: user_id, exp: timestamp, iat: timestamp }`（见 `server/src/util/jwt.rs:6`，不含 `role`，角色由 DB 查询）
- 传输：`Authorization: Bearer <token>` Header
- 校验：AuthUser extractor（先查黑名单 `util::redis::is_token_blacklisted`，再验签名 `jwt::verify_token`）
- 撤销：登出时加入 Redis/内存黑名单（TTL = 剩余有效期）

### RefreshToken（长期令牌）

- 类型：随机 `Uuid::new_v4` 字符串
- 有效期：默认 7 天（可配置 `jwt.refresh_token_expire_days`）
- 存储：`refresh_tokens` 表，SHA-256 哈希存储（`server/src/service/auth.rs:9`）
- 传输：`Refresh-Token: <token>` Header（仅在 Client → Server 时发送，端点 `GET /api/user/refresh`）
- 安全：永不离开本地（存系统密钥库 `vault.rs`），不进入 Web 端

## Token 刷新流程

```
Web 端                      Client (Tauri)                  Server (Axum)
  │                              │                                │
  │  AccessToken 即将过期        │                                │
  │                              │                                │
  │  invoke("refresh_access_token")                               │
  │─────────────────────────────►│                                │
  │                              │                                │
  │                              │  从 keyring 读取 RefreshToken  │
  │                              │                                │
  │                              │  GET /api/user/refresh         │
  │                              │  Refresh-Token: <token>        │
  │                              │───────────────────────────────►│
  │                              │                                │
  │                              │                                │ 校验 RefreshToken
  │                              │                                │ 签发新 AccessToken
  │                              │                                │
  │                              │◄─ new access_token             │
  │                              │                                │
  │                              │ 更新内存中的 access_token       │
  │                              │                                │
  │◄── new access_token ────────│                                │
  │                              │                                │
  │  更新本地 access_token       │                                │
```

## 免密自动登录流程

```
应用启动（主窗口 localStorage 读取 Server 配置）
  │
  ├─ invoke("auto_login")  # client/src-tauri/src/lib.rs:237
  │     │
  │     ├─ 从 keyring 读取 last_user_id (vault::load_last_user_id)
  │     │     ├─ 存在 → 读 RefreshToken → GET /api/user/refresh
  │     │     │           ├─ 成功 → 更新内存 access_token/user_id，返回 true → 主窗口切换到「已登录」页（显示用户信息与「打开 Web」按钮）
  │     │     │           └─ 失败 → 返回 false
  │     │     └─ 不存在 → 返回 false
  │     │
  │     └─ 前端根据返回值决定是否展示「已登录」态
```

## 登出流程

```
Web 端 / 主窗口               Client (Tauri)                    Server (Axum)
  │                              │                                    │
  │  invoke("do_logout")         │                                    │
  │─────────────────────────────►│                                    │
  │                              │  POST /api/user/logout            │
  │                              │  Authorization: Bearer <access>    │
  │                              │──────────────────────────────────►│
  │                              │                                    │
  │                              │                                    │ AccessToken → 黑名单（TTL = 剩余有效期）
  │                              │                                    │ RefreshToken (按 user_id) → revoked = true
  │                              │                                    │
  │                              │◄─── 200 OK ───────────────────────│
  │                              │                                    │
  │                              │  清除 keyring 中的凭证 (delete + clear_last_*) │
  │                              │  清空内存 Token + emit auth-state  │
  │◄── 登出成功 ────────────────│                                    │
```

> 实际实现 `client/src-tauri/src/lib.rs:65` 仅发送 `Authorization: Bearer`，按 `user_id` 清除 keyring，不携带 `Refresh-Token` Header（Server 侧按登录用户撤销）。

## 安全设计

| 原则 | 实现方式 |
|------|----------|
| **长 Token 不外传** | RefreshToken 仅存 keyring-rs，绝不发送到 Web 端 |
| **短 Token 不经 URL** | AccessToken 通过 Tauri IPC (`invoke`) 传递，不在 URL 中出现 |
| **IPC 进程内通信** | Token 传递走 Tauri 进程内 IPC，无需暴露网络端口 |
| **系统密钥库** | macOS Keychain / Linux keyutils / Windows Credential Manager |
| **Token 黑名单** | 登出/密码修改时撤销，优先 Redis，回退内存 |
| **密码哈希** | argon2 算法，每个密码独立 salt |
| **登录保护** | 失败次数过多锁定账号（`locked_until`） |

## Tauri IPC 命令

Web 子窗口 / 主窗口与 Client 之间通过 `@tauri-apps/api` 的 `invoke` 通信（共 13 条，见 `client/src-tauri/src/lib.rs:269`）。

### 认证相关

```ts
// 登录 / 注册 / 登出（Web 子窗口 / 主窗口）
const userId = await invoke("do_login", { name, password });
const newId = await invoke("do_register", { name, password });
await invoke("do_logout"); // 两端均可调用，触发 auth-state 广播
```

### Token 相关

```ts
// 获取 AccessToken / 刷新 / 用户 ID
const token = await invoke("get_access_token");
const newToken = await invoke("refresh_access_token");
const userId = await invoke("get_user_id");

// 获取用户信息（含头像，经 GET /api/user/me）
const info = await invoke("get_user_info"); // { user_id, username, avatar }
```

### 服务器配置（主窗口调用）

```ts
await invoke("set_server_url", { url });
const url = await invoke("get_server_url");
const version = await invoke("test_connection", { url }); // GET /api/health
```

### 窗口与外部链接

```ts
await invoke("open_web"); // 打开 Web 子窗口
await invoke("open_time_window"); // 打开 TimeWindow 置顶窗口 /tools/timewindow
await invoke("open_url", { url: "https://example.com" }); // opener 插件打开外部浏览器
await invoke("auto_login"); // -> boolean，免密登录尝试
```

### 认证事件

```ts
import { listen } from "@tauri-apps/api/event";
await listen("auth-state", (event) => {
  const { user_id, username, avatar } = event.payload;
});
```
