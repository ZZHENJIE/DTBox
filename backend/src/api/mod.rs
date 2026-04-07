use crate::middleware::auth_middleware;
use crate::state::AppState;
use axum::{Router, routing::get};
use std::sync::Arc;
use tower_http::{limit::RequestBodyLimitLayer, trace::TraceLayer};

mod auth;
mod market;
mod response;
mod user;

pub use response::*;

/// Create API routes
pub fn create_api_routes(state: Arc<AppState>) -> Router<()> {
    Router::new()
        // Health check
        .route("/health", get(health_check))
        // ========== Public Routes ==========
        .merge(auth::routes())
        // ========== User Routes ==========
        .merge(user::routes())
        // ========== Market Data ==========
        .merge(market::routes())
        // Middleware
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(1024 * 1024 * 10)) // 10MB body limit
        // Auth middleware (checks PUBLIC_PATHS, public routes skip automatically)
        .layer(axum::middleware::from_fn_with_state(
            state.services.clone(),
            auth_middleware,
        ))
        .with_state((*state).clone())
}

/// Health check
async fn health_check() -> JsonResponse<HealthStatus> {
    JsonResponse::success(HealthStatus {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[derive(serde::Serialize)]
struct HealthStatus {
    status: String,
    version: String,
}
