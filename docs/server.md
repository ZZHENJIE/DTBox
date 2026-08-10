# Server（后端 API）

DTBox 后端 API 服务，基于 Axum 0.8 构建，提供用户认证、数据查询等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| HTTP 框架 | Axum 0.8 |
| ORM | SeaORM 2 (SQLite) |
| 认证 | JWT (jsonwebtoken) + argon2 密码哈希 |
| 缓存 / 黑名单 | Redis（可选，回退内存） |
| 限流 | tower-http + IP 识别 |
| 图表渲染 | plotters (K 线图) |
| 日志 | tracing |

## 目录结构

```
server/
├── config.toml              # 配置文件 (gitignore)
├── config.example.toml      # 配置文件模板
├── Cargo.toml
├── data.db                  # SQLite 数据库
├── web/                     # Web 前端 (React SPA)
│   └── dist/                # 构建产物
└── src/
    ├── main.rs              # 入口, Router + 中间件
    ├── lib.rs               # AppState + FromRef
    ├── config/mod.rs        # 配置加载
    ├── entity/              # SeaORM 数据模型
    │   ├── users.rs         # 用户表 + Role 枚举
    │   ├── refresh_tokens.rs
    │   ├── login_logs.rs
    │   └── stocks.rs
    ├── handler/             # 路由处理器
    │   ├── health.rs        # GET /api/health
    │   ├── user.rs          # /api/user/*
    │   ├── admin.rs         # /api/admin/*
    │   ├── stock.rs         # /api/stock/*
    │   ├── tool.rs          # /api/tool/*
    │   ├── finviz.rs        # /api/finviz/*
    │   ├── benzinga.rs      # /api/benzinga/*
    │   └── alpaca.rs        # /api/alpaca/*
    ├── middleware/
    │   ├── auth.rs          # AuthUser / RefreshUser extractor
    │   └── rate_limit.rs    # IP 限流
    ├── service/             # 业务逻辑
    │   ├── auth.rs          # Token 存储/校验/撤销
    │   ├── user.rs          # 用户 CRUD
    │   ├── stock.rs         # 股票搜索
    │   ├── chart.rs         # K 线图渲染
    │   ├── finviz.rs
    │   ├── alpaca.rs
    │   └── tool/timestamp.rs
    └── util/
        ├── jwt.rs           # JWT 签发/校验
        ├── hash.rs          # argon2 密码哈希
        └── redis.rs         # Redis 连接管理
```

## 数据库表

### users

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 主键 |
| name | TEXT UNIQUE | 用户名 |
| avatar | TEXT | 头像 URL |
| password_hash | TEXT | argon2 密码哈希 |
| role | INTEGER | 1=User, 2=Subscriber, 5=Admin |
| settings | JSON | 用户设置 |
| created_at | DATETIME | 创建时间 |
| locked_until | DATETIME | 锁定截止时间 |
| failed_attempts | INTEGER | 连续失败次数 |

### refresh_tokens

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 主键 |
| user_id | INTEGER UNIQUE | 关联用户 |
| token_hash | TEXT UNIQUE | RefreshToken SHA-256 |
| revoked | BOOLEAN | 是否已撤销 |
| expires_at | DATETIME | 过期时间 |
| created_at | DATETIME | 创建时间 |

### stocks

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 主键 |
| symbol | TEXT UNIQUE | 股票代码 |
| name | TEXT | 公司名称 |
| logo | BLOB | Logo PNG 二进制 |

### login_logs

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 主键 |
| user_id | INTEGER | 用户 ID |
| ip | TEXT | 登录 IP |
| success | BOOLEAN | 是否成功 |
| created_at | DATETIME | 登录时间 |

## 认证中间件

### AuthUser

提取 `Authorization: Bearer <token>` Header，校验 JWT 签名与黑名单，注入 Handler。

### RefreshUser

提取 `Refresh-Token: <token>` Header，校验 token_hash 与过期时间，注入 Handler。

### 权限分层

| Extractor | 所获信息 | 用于路由 |
|-----------|----------|----------|
| `AuthUser` | `user_id`, `role` | 一般认证接口 |
| `AuthUser + role >= Subscriber` | 同上 | 数据查询接口 |
| `AuthUser + role >= Admin` | 同上 | 管理接口 |
| `RefreshUser` | `user_id` | Token 刷新 |

## 限流

基于 IP 的请求限流，配置项：

```toml
[rate_limiter]
max_requests = 100
window_seconds = 60
```

## Redis

Redis 为可选依赖：

- **已连接**：Token 黑名单持久化到 Redis，进程重启后依然有效
- **未连接 / 不可达**：自动回退为内存存储，进程重启后黑名单清空

## 启动

```bash
cd server
cp config.example.toml config.toml
cargo run
```

或在 workspace 根目录：

```bash
cargo run --package Server
```
