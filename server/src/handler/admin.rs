use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use shared::{AdminChangeRequest, ApiResponse};

use crate::middleware::auth::AdminUser;
use crate::service;
use crate::AppState;

pub async fn get_user_list(
    State(state): State<AppState>,
    _user: AdminUser,
    Path(page): Path<u64>,
) -> impl IntoResponse {
    let page_size = 20u64;
    match service::user::admin_get_users(&state.db, page, page_size).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}

pub async fn change_user(
    State(state): State<AppState>,
    _user: AdminUser,
    Json(req): Json<AdminChangeRequest>,
) -> impl IntoResponse {
    match service::user::admin_update_user(
        &state.db,
        req.user_id,
        req.name,
        req.avatar,
        req.role,
        req.settings,
    )
    .await
    {
        Ok(updated) => {
            let info: shared::InfoResult = updated.into();
            (StatusCode::OK, Json(ApiResponse::success(info))).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}
