use axum::{http::StatusCode, response::IntoResponse, Json};
use shared::ApiResponse;

pub async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, Json(ApiResponse::ok()))
}
