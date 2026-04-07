use crate::{
    error::{AppError, AuthError},
    service::Services,
};
use axum::{
    extract::{Request, State},
    http::header::AUTHORIZATION,
    middleware::Next,
    response::{IntoResponse, Response},
};

/// Public routes (no auth required)
const PUBLIC_PATHS: &[&str] = &[
    "/health",
    "/auth/register",
    "/auth/login",
    "/auth/refresh",
    "/auth/logout",
    "/auth/check-username",
];

/// JWT auth middleware - paths not in PUBLIC_PATHS require authentication
pub async fn auth_middleware(
    State(services): State<Services>,
    mut request: Request,
    next: Next,
) -> Response {
    let path = request.uri().path();

    // Skip auth for public routes
    if PUBLIC_PATHS.iter().any(|p| path.starts_with(p)) {
        return next.run(request).await;
    }

    // Extract token from request header
    let token = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "));

    let token = match token {
        Some(token) => token,
        None => {
            return AppError::Auth(AuthError::MissingToken).into_response();
        }
    };

    // Verify token
    match services.auth().verify_access_token(token).await {
        Ok(claims) => {
            request.extensions_mut().insert(claims);
            next.run(request).await
        }
        Err(e) => e.into_response(),
    }
}

/// Optional auth middleware (doesn't require login)
pub async fn optional_auth_middleware(
    State(services): State<Services>,
    mut request: Request,
    next: Next,
) -> Response {
    // Try to extract token from request header
    if let Some(token) = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
    {
        // Try to verify token, don't block request on failure
        if let Ok(claims) = services.auth().verify_access_token(token).await {
            request.extensions_mut().insert(claims);
        }
    }

    next.run(request).await
}

/// Request logging middleware
pub async fn logging_middleware(request: Request, next: Next) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();
    let start = std::time::Instant::now();

    tracing::info!("{} {} - started", method, uri);

    let response = next.run(request).await;

    let duration = start.elapsed();
    let status = response.status();

    tracing::info!("{} {} - {} - {:?}", method, uri, status.as_u16(), duration);

    response
}
