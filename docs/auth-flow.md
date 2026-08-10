# 认证流程

DTBox 的认证机制分为三层：**密码登录**、**Token 管理**、**免密自动登录**。

## 密码登录流程

```
用户 (GUI)                    Client (Tauri)                   Server (Axum)
    │                              │                                │
    │  输入 username + password    │                                │
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
    │◄─── 登录成功 ────────────────│                                │
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
  │  WS: { type: "refresh" }    │                                │
  │─────────────────────────────►│                                │
  │                              │                                │
  │                              │  从 keyring 读取 RefreshToken  │
  │                              │                                │
  │                              │  POST /api/user/refresh        │
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
  │◄── WS: { type: "access_token", token } ──────────────────────│
  │                              │                                │
  │  更新本地 access_token       │                                │
```

## 免密自动登录流程

```
应用启动
  │
  ├─ 加载本地 Server 配置（Host/Port）
  │
  ├─ 从 keyring 读取 last_user_id
  │     │
  │     ├─ 存在 → 读 RefreshToken → POST /api/user/refresh
  │     │           │
  │     │           ├─ 刷新成功 → 启动 WebSocket → Logged In（无需密码）
  │     │           └─ 刷新失败 → 进入 Login 页面
  │     │
  │     └─ 不存在 → 进入 Login 页面
```

## 登出流程

```
Client (Tauri)                    Server (Axum)
  │                                    │
  │  POST /api/user/logout            │
  │  Authorization: Bearer <access>    │
  │  Refresh-Token: <refresh>         │
  │──────────────────────────────────►│
  │                                    │
  │                                    │ AccessToken → 黑名单（TTL = 剩余有效期）
  │                                    │ RefreshToken → revoked = true
  │                                    │
  │◄─── 200 OK ───────────────────────│
  │                                    │
  │  清除 keyring 中的凭证             │
  │  清空内存 Token                    │
  │  关闭 WebSocket 服务               │
```

## 安全设计

| 原则 | 实现方式 |
|------|----------|
| **长 Token 不外传** | RefreshToken 仅存 keyring-rs，绝不发送到 Web 端 |
| **短 Token 不经 URL** | AccessToken 通过 WebSocket 推送，不在 URL 中出现 |
| **WebSocket 本地绑定** | 仅监听 `127.0.0.1`，外部不可达 |
| **随机端口** | 每次启动随机分配，降低端口劫持风险 |
| **系统密钥库** | macOS Keychain / Linux keyutils / Windows Credential Manager |
| **Token 黑名单** | 登出/密码修改时撤销，优先 Redis，回退内存 |
| **密码哈希** | argon2 算法，每个密码独立 salt |
| **登录保护** | 失败次数过多锁定账号（`locked_until`） |

## WebSocket 协议

### 连接地址

```
ws://127.0.0.1:<port>
```

`<port>` 由 Client 通过 URL 参数 `?ws_port=<port>` 传递给 Web 端。

### 消息格式

所有消息均为 JSON，顶层包含 `type` 字段。

#### Client → Web（推送）

**推送 AccessToken：**

```json
{ "type": "access_token", "token": "eyJhbG..." }
```

**Token 刷新失败：**

```json
{ "type": "error", "message": "token refresh failed" }
```

#### Web → Client（请求）

**请求刷新 Token：**

```json
{ "type": "refresh" }
```
