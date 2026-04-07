use crate::{
    api::{JsonResponse, response::ApiResponse},
    error::AppError,
    state::AppState,
};
use axum::{
    Json, Router,
    body::Body,
    extract::State,
    http::{
        StatusCode,
        header::{COOKIE, HeaderMap, SET_COOKIE},
    },
    response::Response,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};

/// Auth routes
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/refresh", post(refresh_token))
        .route("/auth/logout", post(logout))
        .route("/auth/check-username", get(check_username))
}

// ============== Request/Response DTO ==============

#[derive(Deserialize, Debug)]
pub struct RegisterRequest {
    username: String,
    password: String,
}

#[derive(Serialize, Debug)]
pub struct RegisterResponse {
    user_id: i32,
    username: String,
}

#[derive(Deserialize, Debug)]
pub struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize, Debug)]
pub struct LoginResponse {
    access_token: String,
    token_type: String,
    expires_in: i32,
}

#[derive(Serialize, Debug)]
pub struct RefreshResponse {
    access_token: String,
    token_type: String,
    expires_in: i32,
}

#[derive(Deserialize, Debug)]
pub struct CheckUsernameRequest {
    username: String,
}

#[derive(Serialize, Debug)]
pub struct CheckUsernameResponse {
    available: bool,
}

// ============== Handler Implementation ==============

/// User registration
pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<JsonResponse<RegisterResponse>, AppError> {
    let user = state
        .services
        .auth()
        .register(&req.username, &req.password)
        .await?;

    Ok(JsonResponse::success(RegisterResponse {
        user_id: user.id,
        username: user.username,
    }))
}

/// User login
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Response, AppError> {
    let result = state
        .services
        .auth()
        .login(&req.username, &req.password)
        .await?;

    let secure_flag = if state.config.web.secure_cookie {
        "; Secure"
    } else {
        ""
    };
    let refresh_cookie = format!(
        "refresh_token={}; HttpOnly; SameSite=Lax; Path=/api; Max-Age={}{}",
        result.tokens.refresh_token,
        7 * 24 * 60 * 60,
        secure_flag
    );

    let response_data = ApiResponse {
        success: true,
        data: Some(LoginResponse {
            access_token: result.tokens.access_token,
            token_type: "Bearer".to_string(),
            expires_in: 1800,
        }),
        message: None,
    };
    let body = serde_json::to_string(&response_data).map_err(|_| AppError::Internal)?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header(SET_COOKIE, refresh_cookie)
        .body(Body::from(body))
        .map_err(|_| AppError::Internal)?;

    Ok(response)
}

/// Refresh token
pub async fn refresh_token(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Response, AppError> {
    let cookie_header = headers
        .get(COOKIE)
        .and_then(|h| h.to_str().ok())
        .ok_or(AppError::Auth(
            crate::error::AuthError::RefreshTokenNotFound,
        ))?;

    let refresh_token = cookie_header
        .split(';')
        .find(|s| s.trim().starts_with("refresh_token="))
        .and_then(|s| s.trim().strip_prefix("refresh_token="))
        .ok_or(AppError::Auth(
            crate::error::AuthError::RefreshTokenNotFound,
        ))?;

    let result = state.services.auth().refresh_token(refresh_token).await?;

    let secure_flag = if state.config.web.secure_cookie {
        "; Secure"
    } else {
        ""
    };
    let refresh_cookie = format!(
        "refresh_token={}; HttpOnly; SameSite=Lax; Path=/api; Max-Age={}{}",
        result.refresh_token,
        7 * 24 * 60 * 60,
        secure_flag
    );

    let response_data = ApiResponse {
        success: true,
        data: Some(RefreshResponse {
            access_token: result.access_token,
            token_type: "Bearer".to_string(),
            expires_in: 1800,
        }),
        message: None,
    };
    let body = serde_json::to_string(&response_data).map_err(|_| AppError::Internal)?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header(SET_COOKIE, refresh_cookie)
        .body(Body::from(body))
        .map_err(|_| AppError::Internal)?;

    Ok(response)
}

/// User logout
pub async fn logout(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Response, AppError> {
    if let Some(cookie_header) = headers.get(COOKIE).and_then(|h| h.to_str().ok()) {
        if let Some(refresh_token) = cookie_header
            .split(';')
            .find(|s| s.trim().starts_with("refresh_token="))
            .and_then(|s| s.trim().strip_prefix("refresh_token="))
        {
            let _ = state.services.auth().logout(refresh_token).await;
        }
    }

    let secure_flag = if state.config.web.secure_cookie {
        "; Secure"
    } else {
        ""
    };
    let clear_cookie = format!(
        "refresh_token=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0{}",
        secure_flag
    );

    let response_data = ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Logout successful".to_string()),
    };
    let body = serde_json::to_string(&response_data).map_err(|_| AppError::Internal)?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header(SET_COOKIE, clear_cookie)
        .body(Body::from(body))
        .map_err(|_| AppError::Internal)?;

    Ok(response)
}

/// Check if username is available
pub async fn check_username(
    State(state): State<AppState>,
    axum::extract::Query(req): axum::extract::Query<CheckUsernameRequest>,
) -> Result<JsonResponse<CheckUsernameResponse>, AppError> {
    let available = state
        .services
        .user()
        .check_username_available(&req.username)
        .await?;
    Ok(JsonResponse::success(CheckUsernameResponse { available }))
}
