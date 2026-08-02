use axum::{
    extract::{ConnectInfo, Query, State},
    http::{header, StatusCode},
    response::IntoResponse,
    Json,
};
use shared::{
    ApiResponse, UserCheckQuery, UserCheckResult, UserCreateRequest, UserCreateResult,
    UserLoginRequest, UserLoginResult, UserPasswordRequest, UserProfileRequest,
    UserRefreshResult, InfoResult,
};
use std::net::SocketAddr;

use crate::middleware::auth::{AuthUser, RefreshUser};
use crate::middleware::rate_limit;
use crate::service;
use crate::util;
use crate::AppState;

#[axum::debug_handler]
pub async fn check_user(
    State(state): State<AppState>,
    Query(query): Query<UserCheckQuery>,
) -> impl IntoResponse {
    match service::user::check_user_exists(&state.db, &query.name).await {
        Ok(exists) => (StatusCode::OK, Json(ApiResponse::success(UserCheckResult { exists }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}

#[axum::debug_handler]
pub async fn create_user(
    State(state): State<AppState>,
    Json(req): Json<UserCreateRequest>,
) -> impl IntoResponse {
    if let Err(msg) = service::user::validate_username(&req.name) {
        return (StatusCode::BAD_REQUEST, Json(ApiResponse::<()>::error(msg))).into_response();
    }
    if let Err(msg) = service::user::validate_password(&req.password) {
        return (StatusCode::BAD_REQUEST, Json(ApiResponse::<()>::error(msg))).into_response();
    }

    let exists = match service::user::check_user_exists(&state.db, &req.name).await {
        Ok(e) => e,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    if exists {
        return (StatusCode::CONFLICT, Json(ApiResponse::<()>::error("Username already exists"))).into_response();
    }

    let password_hash = match crate::util::hash::hash_password(&req.password) {
        Ok(h) => h,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    match service::user::create_user(&state.db, &req.name, &password_hash).await {
        Ok(user_id) => (StatusCode::CREATED, Json(ApiResponse::success(UserCreateResult { user_id }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}

#[axum::debug_handler]
pub async fn login(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: axum::http::HeaderMap,
    Json(req): Json<UserLoginRequest>,
) -> impl IntoResponse {
    let ip = rate_limit::client_ip(addr, &headers);

    let user = match service::user::find_user_by_name(&state.db, &req.name).await {
        Ok(Some(u)) => u,
        Ok(None) => return (StatusCode::UNAUTHORIZED, Json(ApiResponse::<()>::error("Invalid username or password"))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    if service::user::is_account_locked(&state.db, user.id).await.unwrap_or(false) {
        return (StatusCode::FORBIDDEN, Json(ApiResponse::<()>::error("Account is locked due to too many failed attempts, try again later"))).into_response();
    }

    match crate::util::hash::verify_password(&req.password, &user.password_hash) {
        Ok(true) => {}
        _ => {
            let _ = service::user::handle_failed_login(&state.db, user.id).await;
            let _ = service::user::record_login_log(&state.db, user.id, &ip, false).await;
            return (StatusCode::UNAUTHORIZED, Json(ApiResponse::<()>::error("Invalid username or password"))).into_response();
        }
    }

    let _ = service::user::handle_successful_login(&state.db, user.id).await;
    let _ = service::user::record_login_log(&state.db, user.id, &ip, true).await;

    let access_token = match crate::util::jwt::create_access_token(user.id, &state.config.jwt) {
        Ok(t) => t,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    let refresh_token = match service::auth::store_refresh_token(&state.db, user.id, &state.config).await {
        Ok(t) => t,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    let result = UserLoginResult {
        access_token,
        refresh_token,
        user_id: user.id,
    };

    (StatusCode::OK, Json(ApiResponse::success(result))).into_response()
}

#[axum::debug_handler]
pub async fn logout(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    if let Some(token) = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
    {
        let ttl = state.config.jwt.access_token_expire_minutes * 60;
        let _ = util::redis::blacklist_access_token(&state.redis, token, ttl as usize).await;
    }

    if let Err(e) = service::auth::revoke_refresh_token(&state.db, user_id).await {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response();
    }
    (StatusCode::OK, Json(ApiResponse::ok())).into_response()
}

#[axum::debug_handler]
pub async fn change_password(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(req): Json<UserPasswordRequest>,
) -> impl IntoResponse {
    if let Err(msg) = service::user::validate_password(&req.new_password) {
        return (StatusCode::BAD_REQUEST, Json(ApiResponse::<()>::error(msg))).into_response();
    }
    let user = match service::user::find_user_by_id(&state.db, user_id).await {
        Ok(Some(u)) => u,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(ApiResponse::<()>::error("User not found"))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    match crate::util::hash::verify_password(&req.old_password, &user.password_hash) {
        Ok(true) => {}
            _ => return (StatusCode::BAD_REQUEST, Json(ApiResponse::<()>::error("Invalid old password"))).into_response(),
    }

    let new_hash = match crate::util::hash::hash_password(&req.new_password) {
        Ok(h) => h,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    match service::user::update_password(&state.db, user_id, &new_hash).await {
        Ok(_) => (StatusCode::OK, Json(ApiResponse::ok())).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}

#[axum::debug_handler]
pub async fn update_profile(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(req): Json<UserProfileRequest>,
) -> impl IntoResponse {
    match service::user::update_profile(&state.db, user_id, req.name, req.avatar, req.settings).await {
        Ok(user) => {
            let info: InfoResult = user.into();
            (StatusCode::OK, Json(ApiResponse::success(info))).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}

#[axum::debug_handler]
pub async fn refresh_token(
    State(state): State<AppState>,
    RefreshUser(user_id): RefreshUser,
) -> impl IntoResponse {
    let access_token = match crate::util::jwt::create_access_token(user_id, &state.config.jwt) {
        Ok(t) => t,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    };

    (StatusCode::OK, Json(ApiResponse::success(UserRefreshResult { access_token }))).into_response()
}

#[axum::debug_handler]
pub async fn me(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    match service::user::find_user_by_id(&state.db, user_id).await {
        Ok(Some(user)) => {
            let info: InfoResult = user.into();
            (StatusCode::OK, Json(ApiResponse::success(info))).into_response()
        }
        Ok(None) => (StatusCode::NOT_FOUND, Json(ApiResponse::<()>::error("User not found"))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ApiResponse::<()>::error(e.to_string()))).into_response(),
    }
}
