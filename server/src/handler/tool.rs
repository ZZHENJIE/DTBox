use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use shared::ApiResponse;

use crate::AppState;
use crate::middleware::auth::SubscriberUser;
use crate::service;

pub async fn timestamp_akamai(
    State(state): State<AppState>,
    _user: SubscriberUser,
) -> impl IntoResponse {
    match service::tool::timestamp::akamai(&state.reqwest_client).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}
