use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use shared::{ApiResponse, StockSearchQuery};

use crate::AppState;
use crate::middleware::auth::SubscriberUser;
use crate::service;

pub async fn search(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Query(query): Query<StockSearchQuery>,
) -> impl IntoResponse {
    match service::stock::search_stocks(&state.db, &query.symbol, query.page, query.limit).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}
