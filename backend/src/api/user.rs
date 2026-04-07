use crate::{
    api::JsonResponse, auth::Claims, error::AppError, service::user::UserUpdate, state::AppState,
};
use axum::{
    Extension, Json, Router,
    extract::State,
    routing::{get, post, put},
};
use serde::{Deserialize, Serialize};

/// User routes
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/users/me", get(get_current_user))
        .route("/users/me", post(update_current_user))
        .route("/users/password", put(update_password))
        .route("/users/logout-all", post(logout_all_devices))
}

// ============== Request/Response DTO =============

#[derive(Serialize, Debug)]
pub struct UserInfoResponse {
    pub id: i32,
    pub username: String,
    pub permissions: i32,
    pub config: serde_json::Value,
    pub created_at: String,
}

#[derive(Deserialize, Debug)]
pub struct UpdateUserRequest {
    username: Option<String>,
    config: Option<serde_json::Value>,
}

#[derive(Deserialize, Debug)]
pub struct UpdatePasswordRequest {
    old_password: String,
    new_password: String,
}

#[derive(Serialize, Debug)]
pub struct UpdateUserResponse {
    pub id: i32,
    pub username: String,
    pub permissions: i32,
    pub config: serde_json::Value,
    pub created_at: String,
}

// ============== Handler Implementation =============

/// Get current user info
pub async fn get_current_user(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
) -> Result<JsonResponse<UserInfoResponse>, AppError> {
    let user_info = state
        .services
        .user()
        .get_user_info(claims.user_id())
        .await?;

    Ok(JsonResponse::success(UserInfoResponse {
        id: user_info.id,
        username: user_info.username,
        permissions: user_info.permissions,
        config: user_info.config,
        created_at: user_info.created_at,
    }))
}

/// Update current user info
pub async fn update_current_user(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
    Json(req): Json<UpdateUserRequest>,
) -> Result<JsonResponse<UpdateUserResponse>, AppError> {
    let updates = UserUpdate {
        username: req.username,
        config: req.config,
    };

    let user_info = state
        .services
        .user()
        .update_user(claims.user_id(), updates)
        .await?;

    Ok(JsonResponse::success(UpdateUserResponse {
        id: user_info.id,
        username: user_info.username,
        permissions: user_info.permissions,
        config: user_info.config,
        created_at: user_info.created_at,
    }))
}

/// Update user password
pub async fn update_password(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
    Json(req): Json<UpdatePasswordRequest>,
) -> Result<JsonResponse<()>, AppError> {
    state
        .services
        .user()
        .update_password(claims.user_id(), &req.old_password, &req.new_password)
        .await?;

    Ok(JsonResponse::<()>::ok_with_message("Password changed successfully"))
}

/// Logout from all devices
pub async fn logout_all_devices(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
) -> Result<JsonResponse<()>, AppError> {
    state
        .services
        .auth()
        .logout_all_devices(claims.user_id())
        .await?;
    Ok(JsonResponse::<()>::ok_with_message("Logged out from all devices"))
}
