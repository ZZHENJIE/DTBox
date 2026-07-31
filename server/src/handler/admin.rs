use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use shared::{AdminChangeRequest, ApiResponse};

use crate::entity::users::Role;
use crate::middleware::auth::AuthUser;
use crate::service;
use crate::AppState;

pub async fn get_user_list(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(page): Path<u64>,
) -> impl IntoResponse {
    let user = match service::user::find_user_by_id(&state.db, user_id).await {
        Ok(Some(u)) => u,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(ApiResponse::<()>::error("User not found"))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    if user.role != Role::Admin {
        return (StatusCode::FORBIDDEN, Json(ApiResponse::<()>::error("Insufficient permissions"))).into_response();
    }

    let page_size = 20u64;
    match service::user::admin_get_users(&state.db, page, page_size).await {
        Ok(result) => (StatusCode::OK, Json(ApiResponse::success(result))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}

pub async fn change_user(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(req): Json<AdminChangeRequest>,
) -> impl IntoResponse {
    let user = match service::user::find_user_by_id(&state.db, user_id).await {
        Ok(Some(u)) => u,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(ApiResponse::<()>::error("User not found"))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    if user.role != Role::Admin {
        return (StatusCode::FORBIDDEN, Json(ApiResponse::<()>::error("Insufficient permissions"))).into_response();
    }

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
