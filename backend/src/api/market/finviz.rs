use crate::{
    AppError,
    api::JsonResponse,
    service::market::finviz::{
        CalendarEconomyItem, CalendarEconomyParameter, CandlestickItem, CandlestickParameter,
        EventParameter, EventResult, QuoteParameter, QuoteResult, ScreenerItem, ScreenerParameter,
    },
    state::AppState,
};
use axum::{Json, extract::State};

pub async fn screener(
    State(state): State<AppState>,
    Json(req): Json<ScreenerParameter>,
) -> Result<JsonResponse<Vec<ScreenerItem>>, AppError> {
    let result = state.services().market().finviz().screener(req).await?;
    Ok(JsonResponse::success(result))
}

pub async fn quote(
    State(state): State<AppState>,
    Json(req): Json<QuoteParameter>,
) -> Result<JsonResponse<QuoteResult>, AppError> {
    let result = state.services().market().finviz().quote(req).await?;
    Ok(JsonResponse::success(result))
}

pub async fn event(
    State(state): State<AppState>,
    Json(req): Json<EventParameter>,
) -> Result<JsonResponse<EventResult>, AppError> {
    let result = state.services().market().finviz().event(req).await?;
    Ok(JsonResponse::success(result))
}

pub async fn candlestick(
    State(state): State<AppState>,
    Json(req): Json<CandlestickParameter>,
) -> Result<JsonResponse<Vec<CandlestickItem>>, AppError> {
    let result = state.services().market().finviz().candlestick(req).await?;
    Ok(JsonResponse::success(result))
}

pub async fn calendar_economy(
    State(state): State<AppState>,
    Json(req): Json<CalendarEconomyParameter>,
) -> Result<JsonResponse<Vec<CalendarEconomyItem>>, AppError> {
    let result = state
        .services()
        .market()
        .finviz()
        .calendar_economy(req)
        .await?;
    Ok(JsonResponse::success(result))
}
