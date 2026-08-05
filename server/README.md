# DTBox Server

DTBox 后端 API 服务，基于 Axum 构建的纯 HTTP REST API。提供用户认证（JWT）、数据接口等服务。Client（Tauri 桌面端）通过 HTTP 调用本服务所有 API。

## 与客户端交互

- Client 通过本服务的 HTTP 接口完成**登录**（获得 AccessToken + RefreshToken）
- Client 使用 RefreshToken 定期调用 `/api/user/refresh` **刷新 AccessToken**
- Client 将 AccessToken 通过本地 WebSocket 推送给 Web 端
- Web 端直接通过本服务的 HTTP 接口调用业务 API（携带 AccessToken Bearer Header）

> **注意**：Server 本身不提供 WebSocket 服务。WebSocket 通信发生在 Client ↔ Web 之间，用于 Token 刷新推送。

---

# crate 选择
## 后端开发框架
axum = { version = "0.8", features = ["macros"] }
## 异步运行时
tokio = { version = "1", features = ["full"] }
## ORM
sea-orm = { version = "2", features = ["sqlx-sqlite", "runtime-tokio-rustls", "macros", "with-json", "with-chrono"] }
## 序列化
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
## 时间处理
chrono = { version = "0.4", features = ["serde"] }
## UUID生成
uuid = { version = "1", features = ["v4"] }
## 密码哈希算法
argon2 = "0.5"
## JWT
jsonwebtoken = { version = "11", features = ["rust_crypto"] }
## 随机数生成
getrandom = "0.2"
## 哈希函数
sha2 = "0.11"
## 十六进制编码
hex = "0.4"
## Redis客户端
redis = { version = "1", features = ["tokio-comp"] }
## 正则表达式
regex = "1"
## 配置文件解析
toml = "0.9"
## 日志
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
## 中间件
tower = { version = "0.5", features = ["limit"] }
tower-http = { version = "0.6", features = ["limit", "trace"] }

## shared crate 依赖
// shared/Cargo.toml
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }

## 请求头约定
AccessToken 校验:  Authorization: Bearer <access_token>
RefreshToken 校验: Refresh-Token: <refresh_token>

## 认证机制
AccessToken 为 JWT, 签发后无需服务端存储, 通过 AuthUser extractor 注入 handler。登出时将 AccessToken 加入 Redis/内存黑名单(TTL 为剩余有效期), AuthUser 校验时先查黑名单。
RefreshToken 通过 RefreshUser extractor 注入 handler, 存储在 refresh_tokens 表中(SHA-256 哈希)。
公开接口(login/create/check/health)不使用 extractor, 直接访问。

Redis 为可选依赖, 未连接时自动回退为内存黑名单(进程重启后丢失)。

## API 路由
### 公开接口
| 路由 | 方法 | 说明 |
|------|------|------|
| /api/health | GET | 健康检查 |
| /api/user/check?name={value} | GET | 检查用户名是否存在 |
| /api/user/create | POST | 创建新用户 |
| /api/user/login | POST | 登入, 返回 AccessToken + RefreshToken + UserID |

### 需要 AccessToken
| 路由 | 方法 | 说明 |
|------|------|------|
| /api/user/logout | POST | 登出, 撤销 RefreshToken 并加入 AccessToken 黑名单 |
| /api/user/password | POST | 修改密码, 需校验旧密码 |
| /api/user/profile | POST | 修改基本信息(name/avatar/settings) |
| /api/user/me | GET | 获取当前用户信息 |

### 需要 RefreshToken
| 路由 | 方法 | 说明 |
|------|------|------|
| /api/user/refresh | GET | 刷新 AccessToken |

### 需要 AccessToken + Admin 权限
| 路由 | 方法 | 说明 |
|------|------|------|
| /api/admin/info/{page} | GET | 分页获取用户列表 |
| /api/admin/change | POST | 修改任意用户信息 |

### 需要 AccessToken + Subscriber 权限
| 路由 | 方法 | 说明 |
|------|------|------|
| /api/finviz/stock | POST | Finviz 股票报价 |
| /api/finviz/screener | POST | Finviz 筛选 |
| /api/finviz/news | POST | Finviz 新闻 |
| /api/alpaca/snapshot | POST | Alpaca 快照 |
| /api/stock/search?symbol={keyword}&limit={n}&page={n} | GET | 搜索股票 (symbol 必填) |
| /api/stock/kline_chart | POST | K线图 + 成交量 (返回 PNG 图片) |
| /api/benzinga/calendar/ipo | POST | Benzinga IPO 日历 |
| /api/benzinga/calendar/economics | POST | Benzinga 经济日历 |
| /api/benzinga/calendar/earnings | POST | Benzinga 财报日历 |
| /api/tool/timestamp/akamai | GET | Akamai 时间戳 |

## 部署文档（HTTPS 反向代理）

### Nginx 配置示例

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/ssl/certs/example.com.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy 配置示例

```
example.com {
    reverse_proxy /api/* 127.0.0.1:8080
}
```

> **注意**：Nginx/Caddy 与 Server 之间为内网通信，Server 本身仅监听 HTTP。TLS 终止由反向代理处理。

## shared crate 类型定义
客户端(Tauri)复用这些结构体

### 通用响应
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}
```

### /api/user/check
```rust
#[derive(Debug, Deserialize)]
pub struct UserCheckQuery { pub name: String }

#[derive(Debug, Serialize)]
pub struct UserCheckResult { pub exists: bool }
```

### /api/user/create
```rust
#[derive(Debug, Deserialize)]
pub struct UserCreateRequest { pub name: String, pub password: String }

#[derive(Debug, Serialize)]
pub struct UserCreateResult { pub user_id: i32 }
```

### /api/user/login
```rust
#[derive(Debug, Deserialize)]
pub struct UserLoginRequest { pub name: String, pub password: String }

#[derive(Debug, Serialize)]
pub struct UserLoginResult {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: i32,
}
```

### /api/user/password
```rust
#[derive(Debug, Deserialize)]
pub struct UserPasswordRequest { pub old_password: String, pub new_password: String }
```

### /api/user/profile
```rust
#[derive(Debug, Deserialize)]
pub struct UserProfileRequest {
    pub name: Option<String>,
    pub avatar: Option<String>,
    pub settings: Option<serde_json::Value>,
}
```

### /api/user/refresh
```rust
#[derive(Debug, Serialize)]
pub struct UserRefreshResult { pub access_token: String }
```

### /api/user/me
```rust
// 响应: ApiResponse<InfoResult>
```

### /api/admin/info/{page}
```rust
#[derive(Debug, Serialize)]
pub struct AdminInfoResult {
    pub users: Vec<InfoResult>,
    pub total: u64,
    pub page: u64,
    pub page_size: u64,
}
```

### /api/admin/change
```rust
#[derive(Debug, Deserialize)]
pub struct AdminChangeRequest {
    pub user_id: i32,
    pub name: Option<String>,
    pub avatar: Option<String>,
    pub role: Option<u8>,
    pub settings: Option<serde_json::Value>,
}
// 响应: ApiResponse<InfoResult>
```

### /api/finviz/*
> 请求/响应类型来自 `finviz_sdk` crate，客户端需依赖该 SDK 复用类型。

```
POST /stock       请求: StockQuery       响应: ApiResponse<Stock>
POST /screener    请求: ScreenerQuery     响应: ApiResponse<Vec<Ticker>>  
POST /news        请求: NewsQuery         响应: ApiResponse<Vec<NewsItem>>
```

### /api/alpaca/*
> 请求/响应类型来自 `alpaca_sdk` crate，客户端需依赖该 SDK 复用类型。

```
POST /snapshot   请求: SnapshotQuery    响应: ApiResponse<Snapshot>
```

### /api/stock/search
```rust
#[derive(Debug, Deserialize)]
pub struct StockSearchQuery {
    pub symbol: String,
    pub limit: Option<u64>,
    pub page: Option<u64>,
}

// 响应: ApiResponse<StockSearchResult>
#[derive(Debug, Serialize)]
pub struct StockSearchResult {
    pub stocks: Vec<StockItem>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockItem {
    pub id: i32,
    pub symbol: String,
    pub name: String,
}
```

### /api/stock/kline_chart
> 请求类型来自 `finviz_sdk::StockQuery`，包含 `symbol: String`、`interval: stock::Interval`、`valid_ranges: stock::ValidRanges`。

```
POST /kline_chart     请求: StockQuery      响应: image/png (成功) 或 application/json (错误)
```

图表：上方 K 线蜡烛图（绿涨红跌），下方成交量柱状图。

### /api/benzinga/*
> 请求/响应类型来自 `benzinga_sdk` crate，客户端需依赖该 SDK 复用类型。

```
POST /calendar/ipo         请求: calendar::IPOQuery       响应: ApiResponse<Vec<Ipo>>
POST /calendar/economics   请求: calendar::EconomicsQuery  响应: ApiResponse<Vec<Economics>>
POST /calendar/earnings    请求: calendar::EarningsQuery   响应: ApiResponse<Vec<Earnings>>
```

### 共享类型
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfoResult {
    pub id: i32,
    pub name: String,
    pub avatar: String,
    pub role: u8,
    pub settings: serde_json::Value,
    pub created_at: chrono::NaiveDateTime,
}
```

## 表结构

### users
```rust
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "u8", db_type = "Integer")]
pub enum Role {
    #[sea_orm(num_value = 1)]
    User,
    #[sea_orm(num_value = 2)]
    Subscriber,
    #[sea_orm(num_value = 5)]
    Admin,
}

impl From<Role> for u8 {
    fn from(value: Role) -> u8 {
        match value {
            Role::User => 1,
            Role::Subscriber => 2,
            Role::Admin => 5,
        }
    }
}

impl From<u8> for Role {
    fn from(value: u8) -> Self {
        match value {
            1 => Role::User,
            2 => Role::Subscriber,
            5 => Role::Admin,
            _ => Role::User,
        }
    }
}

#[derive(Clone, Debug, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
    pub avatar: String,
    pub password_hash: String,
    pub role: Role,
    pub settings: serde_json::Value,
    pub created_at: chrono::NaiveDateTime,
    pub locked_until: Option<chrono::NaiveDateTime>,
    pub failed_attempts: u8,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        has_one = "super::refresh_tokens::Entity",
        from = "Column::Id",
        to = "super::refresh_tokens::Column::UserId"
    )]
    RefreshToken,
}

impl Related<super::refresh_tokens::Entity> for Entity {
    fn to() -> RelationDef { Relation::RefreshToken.def() }
}

impl ActiveModelBehavior for ActiveModel {}

impl From<Model> for shared::InfoResult {
    fn from(value: Model) -> Self {
        Self {
            id: value.id,
            name: value.name,
            avatar: value.avatar,
            role: value.role.into(),
            settings: value.settings,
            created_at: value.created_at,
        }
    }
}
```

### refresh_tokens
```rust
#[derive(Clone, Debug, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "refresh_tokens")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub user_id: i32,
    #[sea_orm(unique)]
    pub token_hash: String,
    pub revoked: bool,
    pub expires_at: chrono::NaiveDateTime,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id"
    )]
    User,
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef { Relation::User.def() }
}

impl ActiveModelBehavior for ActiveModel {}
```

### stocks
```rust
#[derive(Clone, Debug, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "stocks")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub symbol: String,
    pub name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
```

### login_logs
```rust
#[derive(Clone, Debug, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "login_logs")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub user_id: i32,
    pub ip: String,
    pub success: bool,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
```

## 配置文件结构
文件格式: config.toml, 可通过 `CONFIG_PATH` 环境变量指定路径。

启动时默认读取 `<CARGO_MANIFEST_DIR>/config.toml`, 即 server 目录下的 config.toml。

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct Config {
    pub server: ServerConfig,
    pub database_url: String,
    pub redis_url: String,
    pub jwt: JWTConfig,
    pub logging_level: String,
    pub data_source: DataSourceConfig,
    pub rate_limiter: RateLimiterConfig,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub web_dir: String,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct JWTConfig {
    pub secret: String,
    pub access_token_expire_minutes: u64,
    pub refresh_token_expire_days: u64,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct DataSourceConfig {
    pub finviz_api_key: String,
    pub alpaca: AlpacaConfig,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct AlpacaConfig {
    pub api_key: String,
    pub api_secret: String,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct RateLimiterConfig {
    pub max_requests: u64,
    pub window_seconds: u64,
}
```

### config.toml 示例
```toml
database_url = "sqlite://data.db?mode=rwc"
redis_url = "redis://127.0.0.1:6379"

logging_level = "info"

[server]
host = "0.0.0.0"
port = 8080
web_dir = ""

[jwt]
secret = "change-me-to-a-random-secret"
access_token_expire_minutes = 10
refresh_token_expire_days = 7

[data_source]
finviz_api_key = ""

[data_source.alpaca]
api_key = ""
api_secret = ""

[rate_limiter]
max_requests = 100
window_seconds = 60
```

## 目录结构
```
server/
├── config.toml          # 配置文件 (gitignore)
├── config.example.toml  # 配置文件模板
├── Cargo.toml
└── src/
    ├── main.rs          # 入口, axum Router + 中间件挂载
    ├── lib.rs           # AppState + FromRef 导出
    ├── config/
    │   └── mod.rs       # 配置结构体与加载
    ├── entity/
    │   ├── mod.rs
    │   ├── users.rs     # Role 枚举 + Model + Relation
    │   ├── refresh_tokens.rs
    │   ├── login_logs.rs
    │   └── stocks.rs
    ├── handler/
    │   ├── mod.rs
    │   ├── health.rs    # GET /api/health
    │   ├── stock.rs     # /api/stock/* (Subscriber+)
    │   ├── tool.rs      # GET /api/tool/*
    │   ├── user.rs      # /api/user/*
    │   ├── admin.rs     # /api/admin/*
    │   ├── finviz.rs    # /api/finviz/* (Subscriber+)
    │   ├── alpaca.rs    # /api/alpaca/* (Subscriber+)
    │   ├── benzinga.rs  # /api/benzinga/* (Subscriber+)
    │   └── alpaca.rs    # /api/alpaca/* (待实现)
    ├── middleware/
    │   ├── mod.rs
    │   ├── auth.rs      # AuthUser / RefreshUser extractor
    │   └── rate_limit.rs # IP 限流中间件
    ├── service/
    │   ├── mod.rs
    │   ├── auth.rs      # Token 存储/校验/撤销
    │   ├── chart.rs     # K线+成交量渲染
    │   ├── stock.rs     # 股票搜索
    │   ├── user.rs      # 用户 CRUD + 分页
    │   └── tool/
    │       └── timestamp.rs  # Akamai 时间戳
    │   ├── finviz.rs    # Finviz quote (示例实现)
    │   └── alpaca.rs    # Alpaca 数据 (待实现)
    └── util/
        ├── mod.rs
        ├── jwt.rs       # JWT 生成/校验
        ├── hash.rs      # argon2 密码哈希
        └── redis.rs     # Redis 黑名单操作

shared/
├── Cargo.toml
└── src/
    └── lib.rs           # 请求/响应结构体, 与 Tauri 客户端共享
```

## 启动

### server 目录
```bash
cd server
cp config.example.toml config.toml  # 编辑 config.toml 填入实际配置
cargo run
```

### workspace 根目录
```bash
cargo run --package Server
```
