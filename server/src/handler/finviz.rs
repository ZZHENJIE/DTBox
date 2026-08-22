use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use finviz_sdk::{EarningsQuery, EconomicsQuery, NewsQuery, ScreenerQuery, StockQuery};
use shared::ApiResponse;

use crate::AppState;
use crate::middleware::auth::SubscriberUser;

pub async fn stock(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<StockQuery>,
) -> impl IntoResponse {
    match state.source.finviz.stock(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}

pub async fn screener(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<ScreenerQuery>,
) -> impl IntoResponse {
    match state.source.finviz.screener(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}

pub async fn news(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<NewsQuery>,
) -> impl IntoResponse {
    match state.source.finviz.news(&req).await {
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
    Json(req): Json<EconomicsQuery>,
) -> impl IntoResponse {
    match state.source.finviz.economics(&req).await {
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
    Json(req): Json<EarningsQuery>,
) -> impl IntoResponse {
    match state.source.finviz.earnings(&req).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}
