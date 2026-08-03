use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use finviz_sdk::QuoteQuery;
use shared::ApiResponse;

use crate::AppState;
use crate::middleware::auth::SubscriberUser;

pub async fn quote(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<QuoteQuery>,
) -> impl IntoResponse {
    match state.source.finviz.quote(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}
