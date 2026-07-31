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
## 配置文件解析
toml = "0.9"
## 日志
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
## 中间件
tower = { version = "0.5", features = ["limit"] }
tower-http = { version = "0.6", features = ["cors", "limit", "trace"] }

## shared crate 依赖
// shared/Cargo.toml
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }

## 请求头约定
AccessToken 校验:  Authorization: Bearer <access_token>
RefreshToken 校验: X-Refresh-Token: <refresh_token>

## 认证机制
AccessToken 通过 AuthUser extractor 注入 handler, 无需手动校验。
RefreshToken 通过 RefreshUser extractor 注入 handler。
公开接口(login/create/check/health)不使用 extractor, 直接访问。

长Token(RefreshToken) 单独建表 refresh_tokens, 每个用户唯一记录。
AccessToken 存储到 Redis, 每个用户一个 key。

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
| /api/user/logout | POST | 登出, 撤销 RefreshToken |
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

### 待实现
| 路由 | 方法 | 说明 |
|------|------|------|
| /api/finviz/screener | GET | Finviz 筛选 |
| /api/finviz/quote | GET | Finviz 报价 |
| /api/alpaca/snapshot | GET | Alpaca 快照 |

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
    │   └── stocks.rs
    ├── handler/
    │   ├── mod.rs
    │   ├── health.rs    # GET /api/health
    │   ├── user.rs      # /api/user/*
    │   ├── admin.rs     # /api/admin/*
    │   ├── finviz.rs    # /api/finviz/* (待实现)
    │   └── alpaca.rs    # /api/alpaca/* (待实现)
    ├── middleware/
    │   ├── mod.rs
    │   ├── auth.rs      # AuthUser / RefreshUser extractor
    │   └── rate_limit.rs # IP 限流中间件
    ├── service/
    │   ├── mod.rs
    │   ├── auth.rs      # Token 存储/校验/撤销
    │   ├── user.rs      # 用户 CRUD + 分页
    │   ├── finviz.rs    # Finviz 数据 (待实现)
    │   └── alpaca.rs    # Alpaca 数据 (待实现)
    └── util/
        ├── mod.rs
        ├── jwt.rs       # JWT 生成/校验
        └── hash.rs      # argon2 密码哈希

shared/
├── Cargo.toml
└── src/
    └── lib.rs           # 请求/响应结构体, 与 Tauri 客户端共享
```

## 启动
```bash
cd server
cp config.example.toml config.toml  # 编辑 config.toml 填入实际配置
cargo run
```

或在 workspace 根目录:
```bash
cargo run --package Server
```
