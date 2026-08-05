use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use benzinga_sdk::calendar;
use shared::ApiResponse;

use crate::AppState;
use crate::middleware::auth::SubscriberUser;

pub async fn calendar_ipo(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<calendar::IPOQuery>,
) -> impl IntoResponse {
    match state.source.benzinga.ipo(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}

pub async fn calendar_economics(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<calendar::EconomicsQuery>,
) -> impl IntoResponse {
    match state.source.benzinga.economics(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}

pub async fn calendar_earnings(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<calendar::EarningsQuery>,
) -> impl IntoResponse {
    match state.source.benzinga.earnings(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}
