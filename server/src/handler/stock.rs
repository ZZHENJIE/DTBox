use axum::{
    Json,
    extract::{Query, State},
    http::{header, StatusCode},
    response::IntoResponse,
};
use finviz_sdk::StockQuery;
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

pub async fn kline_chart(
    State(state): State<AppState>,
    _user: SubscriberUser,
    Json(req): Json<StockQuery>,
) -> impl IntoResponse {
    match state.source.finviz.stock(&req).await {
        Ok(result) => match service::chart::render_kline(&result, &req.symbol) {
            Ok(png) => {
                (StatusCode::OK, [(header::CONTENT_TYPE, "image/png")], png).into_response()
            }
            Err(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(e)),
            )
                .into_response(),
        },
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e.to_string())),
        )
            .into_response(),
    }
}
