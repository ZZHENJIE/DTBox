use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use shared::ApiResponse;

use crate::AppState;

pub struct AuthUser(pub i32);

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| unauthorized("Missing Authorization header"))?;

        let token = header
            .strip_prefix("Bearer ")
            .ok_or_else(|| unauthorized("Authorization header should be Bearer <token>"))?;

        let claims = crate::util::jwt::verify_token(token, &state.config.jwt)
            .map_err(|_| unauthorized("Invalid AccessToken"))?;

        Ok(AuthUser(claims.sub))
    }
}

fn unauthorized(message: &str) -> Response {
    (StatusCode::UNAUTHORIZED, Json(ApiResponse::<()>::error(message))).into_response()
}

pub struct RefreshUser(pub i32);

impl FromRequestParts<AppState> for RefreshUser {
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let token = parts
            .headers
            .get("X-Refresh-Token")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| unauthorized("Missing X-Refresh-Token header"))?;

        let user_id = crate::service::auth::verify_refresh_token(&state.db, token)
            .await
            .map_err(|e| unauthorized(&e.to_string()))?;

        Ok(RefreshUser(user_id))
    }
}
