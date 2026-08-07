use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    pub fn error(message: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message.into()),
        }
    }
}

impl ApiResponse<()> {
    pub fn ok() -> Self {
        Self {
            success: true,
            data: None,
            message: None,
        }
    }
}

// ---------- /api/user/check ----------

#[derive(Debug, Deserialize)]
pub struct UserCheckQuery {
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct UserCheckResult {
    pub exists: bool,
}

// ---------- /api/user/create ----------

#[derive(Debug, Serialize, Deserialize)]
pub struct UserCreateRequest {
    pub name: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserCreateResult {
    pub user_id: i32,
}

// ---------- /api/user/login ----------

#[derive(Debug, Serialize, Deserialize)]
pub struct UserLoginRequest {
    pub name: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserLoginResult {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: i32,
}

// ---------- /api/user/password ----------

#[derive(Debug, Deserialize)]
pub struct UserPasswordRequest {
    pub old_password: String,
    pub new_password: String,
}

// ---------- /api/user/profile ----------

#[derive(Debug, Deserialize)]
pub struct UserProfileRequest {
    pub name: Option<String>,
    pub avatar: Option<String>,
    pub settings: Option<serde_json::Value>,
}

// ---------- /api/user/refresh ----------

#[derive(Debug, Serialize, Deserialize)]
pub struct UserRefreshResult {
    pub access_token: String,
}

// ---------- /api/admin/info ----------

#[derive(Debug, Serialize)]
pub struct AdminInfoResult {
    pub users: Vec<InfoResult>,
    pub total: u64,
    pub page: u64,
    pub page_size: u64,
}

// ---------- /api/admin/change ----------

#[derive(Debug, Deserialize)]
pub struct AdminChangeRequest {
    pub user_id: i32,
    pub name: Option<String>,
    pub avatar: Option<String>,
    pub role: Option<u8>,
    pub settings: Option<serde_json::Value>,
}

// ---------- 共享类型 ----------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfoResult {
    pub id: i32,
    pub name: String,
    pub avatar: String,
    pub role: u8,
    pub settings: serde_json::Value,
    pub created_at: NaiveDateTime,
}

// ---------- /api/stock/search ----------

#[derive(Debug, Deserialize)]
pub struct StockSearchQuery {
    pub symbol: String,
    #[serde(default = "default_stock_limit")]
    pub limit: u64,
    #[serde(default = "default_stock_page")]
    pub page: u64,
}

fn default_stock_limit() -> u64 {
    20
}
fn default_stock_page() -> u64 {
    1
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockItem {
    pub id: i32,
    pub symbol: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logo: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct StockSearchResult {
    pub stocks: Vec<StockItem>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}
