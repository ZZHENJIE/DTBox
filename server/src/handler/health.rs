use axum::{http::StatusCode, response::IntoResponse, Json};
use shared::{ApiResponse, HealthCheckResult};

pub async fn health_check() -> impl IntoResponse {
    let result = HealthCheckResult {
        version: env!("CARGO_PKG_VERSION").to_string(),
    };
    (StatusCode::OK, Json(ApiResponse::success(result)))
}
