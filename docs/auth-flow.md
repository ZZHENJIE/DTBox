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
- 有效期：默认 10 分钟（可配置）
- 载荷：`{ sub: user_id, role: u8, exp: timestamp }`
- 传输：`Authorization: Bearer <token>` Header
- 校验：AuthUser extractor（先查黑名单，再验签名）
- 撤销：登出时加入 Redis/内存黑名单（TTL = 剩余有效期）

### RefreshToken（长期令牌）

- 类型：随机字节
- 有效期：默认 7 天（可配置）
- 存储：`refresh_tokens` 表，SHA-256 哈希存储
- 传输：`Refresh-Token: <token>` Header（仅在 Client → Server 时发送）
- 安全：永不离开本地（存系统密钥库），不进入 Web 端

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
应用启动
  │
  ├─ 主窗口加载，读取 Server 配置
  │
  ├─ 从 keyring 读取 last_user_id
  │     │
  │     ├─ 存在 → 读 RefreshToken → GET /api/user/refresh
  │     │           │
  │     │           ├─ 刷新成功 → 打开 Web 子窗口（无需密码）
  │     │           └─ 刷新失败 → 打开 Web 子窗口，进入登录页
  │     │
  │     └─ 不存在 → 打开 Web 子窗口，进入登录页
```

## 登出流程

```
Web 端                       Client (Tauri)                    Server (Axum)
  │                              │                                    │
  │  invoke("do_logout")         │                                    │
  │─────────────────────────────►│                                    │
  │                              │  POST /api/user/logout            │
  │                              │  Authorization: Bearer <access>    │
  │                              │  Refresh-Token: <refresh>         │
  │                              │──────────────────────────────────►│
  │                              │                                    │
  │                              │                                    │ AccessToken → 黑名单（TTL = 剩余有效期）
  │                              │                                    │ RefreshToken → revoked = true
  │                              │                                    │
  │                              │◄─── 200 OK ───────────────────────│
  │                              │                                    │
  │                              │  清除 keyring 中的凭证             │
  │                              │  清空内存 Token                    │
  │◄── 登出成功 ────────────────│                                    │
```

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

Web 子窗口与 Client 之间通过 `@tauri-apps/api` 的 `invoke` 通信。

### 认证相关

```ts
// 登录 / 注册（Web 子窗口调用）
const userId = await invoke("do_login", { name, password });
const newId = await invoke("do_register", { name, password });
await invoke("do_logout");
```

### Token 相关

```ts
// 获取 AccessToken
const token = await invoke("get_access_token");

// 刷新 AccessToken
const newToken = await invoke("refresh_access_token");

// 获取用户 ID
const userId = await invoke("get_user_id");
```

### 服务器配置（主窗口调用）

```ts
await invoke("set_server_url", { url });
const url = await invoke("get_server_url");
```
