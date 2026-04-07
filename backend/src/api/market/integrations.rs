use crate::{
    AppError,
    api::JsonResponse,
    service::market::integrations::{IPOScoopItem, SPACResearchItem},
    state::AppState,
};
use axum::extract::State;

pub async fn ipo_scoop(
    State(state): State<AppState>,
) -> Result<JsonResponse<Vec<IPOScoopItem>>, AppError> {
    let result = state.services().market().integrations().ipo_scoop().await?;
    Ok(JsonResponse::success(result))
}

pub async fn spac_research(
    State(state): State<AppState>,
) -> Result<JsonResponse<Vec<SPACResearchItem>>, AppError> {
    let result = state
        .services()
        .market()
        .integrations()
        .spac_research()
        .await?;
    Ok(JsonResponse::success(result))
}
