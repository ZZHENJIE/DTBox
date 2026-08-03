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

// ---------- /api/tools/calendar/tradingview_economic ----------
#[derive(Debug, Deserialize)]
pub struct CalendarEconomicQuery {
    pub from: chrono::DateTime<chrono::Utc>,
    pub to: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradingviewEconomicCalendarItem {
    pub actual: Option<f64>,
    pub actual_raw: Option<f64>,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub comment: Option<String>,
    pub country: String,
    pub currency: String,
    pub date: chrono::DateTime<chrono::Utc>,
    pub forecast: Option<f64>,
    pub forecast_raw: Option<f64>,
    pub id: String,
    pub importance: i8,
    pub indicator: String,
    pub period: String,
    pub previous: Option<f64>,
    pub previous_raw: Option<f64>,
    #[serde(default)]
    pub reference_date: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(default)]
    pub scale: Option<String>,
    pub source: String,
    #[serde(rename = "source_url")]
    pub source_url: String,
    #[serde(default)]
    pub ticker: Option<String>,
    pub title: String,
    #[serde(default)]
    pub unit: Option<String>,
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
}

#[derive(Debug, Serialize)]
pub struct StockSearchResult {
    pub stocks: Vec<StockItem>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}
