use axum::{
    extract::{FromRef, FromRequestParts},
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use shared::ApiResponse;

use crate::entity::users::Role;
use crate::service;
use crate::util;
use crate::AppState;

pub struct AuthUser(pub i32);

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
    AppState: FromRef<S>,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        let claims = verify_token(parts, &state).await?;
        Ok(AuthUser(claims.sub))
    }
}

fn extract_bearer_token(parts: &Parts) -> Result<&str, Response> {
    let header = parts
        .headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| unauthorized("Missing Authorization header"))?;

    header
        .strip_prefix("Bearer ")
        .ok_or_else(|| unauthorized("Authorization header should be Bearer <token>"))
}

fn unauthorized(message: &str) -> Response {
    (StatusCode::UNAUTHORIZED, Json(ApiResponse::<()>::error(message))).into_response()
}

fn forbidden(message: &str) -> Response {
    (StatusCode::FORBIDDEN, Json(ApiResponse::<()>::error(message))).into_response()
}

async fn verify_token(parts: &Parts, state: &AppState) -> Result<crate::util::jwt::Claims, Response> {
    let token = extract_bearer_token(parts)?;

    if util::redis::is_token_blacklisted(&state.redis, token)
        .await
        .unwrap_or(false)
    {
        return Err(unauthorized("AccessToken has been revoked"));
    }

    crate::util::jwt::verify_token(token, &state.config.jwt)
        .map_err(|_| unauthorized("Invalid AccessToken"))
}

async fn verify_user_with_role(
    parts: &Parts,
    state: &AppState,
    allow: fn(&Role) -> bool,
) -> Result<(i32, Role), Response> {
    let claims = verify_token(parts, state).await?;

    let user = service::user::find_user_by_id(&state.db, claims.sub)
        .await
        .map_err(|e| unauthorized(&e.to_string()))?
        .ok_or_else(|| unauthorized("User not found"))?;

    if !allow(&user.role) {
        return Err(forbidden("Insufficient permissions"));
    }

    Ok((claims.sub, user.role))
}

pub struct RefreshUser(pub i32);

impl<S> FromRequestParts<S> for RefreshUser
where
    S: Send + Sync,
    AppState: FromRef<S>,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);

        let token = parts
            .headers
            .get("Refresh-Token")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| unauthorized("Missing Refresh-Token header"))?;

        let user_id = crate::service::auth::verify_refresh_token(&state.db, token)
            .await
            .map_err(|e| unauthorized(&e.to_string()))?;

        Ok(RefreshUser(user_id))
    }
}

pub struct SubscriberUser(pub i32);

impl<S> FromRequestParts<S> for SubscriberUser
where
    S: Send + Sync,
    AppState: FromRef<S>,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        let (user_id, _) = verify_user_with_role(parts, &state, |r| *r != Role::User).await?;
        Ok(SubscriberUser(user_id))
    }
}

pub struct AdminUser(pub i32);

impl<S> FromRequestParts<S> for AdminUser
where
    S: Send + Sync,
    AppState: FromRef<S>,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        let (user_id, _) = verify_user_with_role(parts, &state, |r| *r == Role::Admin).await?;
        Ok(AdminUser(user_id))
    }
}
