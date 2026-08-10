# Client（桌面端）

DTBox 桌面客户端，基于 Tauri 2 构建，负责用户登录、注册和本地凭证管理。

## 核心功能

- **用户注册 / 登录**：通过 Tauri 原生 HTTP（Rust 端 reqwest）调用 Server API
- **免密自动登录**：RefreshToken 存入系统密钥库，下次启动自动刷新，无需重新输入密码
- **凭证安全存储**：keyring-rs（系统密钥库）+ 内存
- **本地 WebSocket 服务**：127.0.0.1 随机端口，供 Web 端获取和刷新 AccessToken
- **TimeTool 悬浮窗口**：独立置顶窗口，Akamai 时间戳 + 美国经济数据
- **APi 自动刷新**：Rust 侧 api.rs 封装了带自动 Token 刷新的 HTTP 方法

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Tauri 2 |
| 前端 UI | React 19 + TypeScript |
| 构建工具 | Vite |
| Rust 原生 | keyring-rs, reqwest, tokio-tungstenite, benzinga_sdk |

## 页面流程

```
Settings ──► Login ──► Logged In ──► Open Web ──► 打开浏览器
                         │
                         ├── TimeTool → 新窗口（置顶）
                         └── Logout
```

## 状态管理

```
┌───────────────┐
│   AppState    │
├───────────────┤
│ server_host   │  Server 地址 (用户可配置)
│ server_port   │  Server 端口 (用户可配置)
│ access_token  │  当前 AccessToken (仅内存)
│ ws_port       │  WebSocket 监听端口 (随机)
│ state_updated │  状态变更通知 (watch channel)
│ logged_in     │  是否已登录
│ user_id       │  当前用户 ID
│ user_name     │  当前用户名
└───────────────┘
```

## 凭证存储

| 数据 | 存储位置 | 说明 |
|------|----------|------|
| RefreshToken | keyring-rs | 系统密钥库，永不离开本地 |
| UserID | keyring-rs | 用于免密自动登录 |
| AccessToken | 内存 | 短期有效，不持久化 |
| Server 配置 | 本地文件 / 用户设置 | Host + Port |

## HTTP API 自动刷新

所有通过 `api.rs` 发出的请求，在首次失败时自动刷新并重试：

```
HTTP 请求
  ├─ 带当前 AccessToken (Bearer) 发送
  ├─ 成功 → 返回数据
  └─ 失败 →
       ├─ 从 keyring 加载 RefreshToken
       ├─ 调用 POST /api/user/refresh
       ├─ 更新 state.access_token
       └─ 用新 Token 重试请求
```

## WebSocket 服务

连接地址：`ws://127.0.0.1:<随机端口>`

消息类型：
- `access_token`：Client → Web，推送 Token
- `refresh`：Web → Client，请求刷新
- `error`：Client → Web，错误通知

## TimeTool 窗口

Logged In 状态下点击 TimeTool 打开置顶独立窗口：

1. **Akamai 时间戳**：获取 CDN 时间，每秒 +1 实时显示
2. **美国经济数据**：Benzinga 日历数据，筛选 `country == "USA"`

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
