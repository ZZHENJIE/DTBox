use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use thiserror::Error;

/// Application error types
#[derive(Error, Debug)]
pub enum AppError {
    /// Database error
    #[error("Database error: {0}")]
    Database(#[from] sea_orm::DbErr),

    /// Auth error
    #[error("Authentication error: {0}")]
    Auth(AuthError),

    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),

    /// Business logic error
    #[error("Business error: {0}")]
    Business(BusinessError),

    /// External service error
    #[error("External service error: {0}")]
    External(String),

    /// Internal server error
    #[error("Internal server error")]
    Internal,

    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),
}

/// Auth-related errors
#[derive(Error, Debug, Clone)]
pub enum AuthError {
    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Token expired")]
    TokenExpired,

    #[error("Token invalid")]
    TokenInvalid,

    #[error("Token revoked")]
    TokenRevoked,

    #[error("Refresh token not found")]
    RefreshTokenNotFound,

    #[error("User not found")]
    UserNotFound,

    #[error("Permission denied")]
    PermissionDenied,

    #[error("Missing token")]
    MissingToken,
}

/// Business logic errors
#[derive(Error, Debug, Clone)]
pub enum BusinessError {
    #[error("User already exists")]
    UserAlreadyExists,

    #[error("Invalid username or password")]
    InvalidLogin,

    #[error("Resource not found")]
    NotFound,

    #[error("Rate limit exceeded")]
    RateLimitExceeded,
}

/// API error response
#[derive(Serialize, Debug)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: ErrorDetail,
}

#[derive(Serialize, Debug)]
pub struct ErrorDetail {
    pub code: String,
    pub message: String,
}

impl ErrorResponse {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            success: false,
            error: ErrorDetail {
                code: code.into(),
                message: message.into(),
            },
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_response) = match &self {
            AppError::Auth(auth_err) => match auth_err {
                AuthError::InvalidCredentials => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_INVALID_CREDENTIALS", "Invalid username or password"),
                ),
                AuthError::TokenExpired => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_TOKEN_EXPIRED", "Token expired"),
                ),
                AuthError::TokenInvalid => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_TOKEN_INVALID", "Token invalid"),
                ),
                AuthError::TokenRevoked => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_TOKEN_REVOKED", "Token has been revoked"),
                ),
                AuthError::RefreshTokenNotFound => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_REFRESH_NOT_FOUND", "Refresh token not found"),
                ),
                AuthError::UserNotFound => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_USER_NOT_FOUND", "User not found"),
                ),
                AuthError::PermissionDenied => (
                    StatusCode::FORBIDDEN,
                    ErrorResponse::new("AUTH_PERMISSION_DENIED", "Permission denied"),
                ),
                AuthError::MissingToken => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("AUTH_MISSING_TOKEN", "Missing authentication token"),
                ),
            },
            AppError::Validation(msg) => (
                StatusCode::BAD_REQUEST,
                ErrorResponse::new("VALIDATION_ERROR", msg.clone()),
            ),
            AppError::Business(business_err) => match business_err {
                BusinessError::UserAlreadyExists => (
                    StatusCode::CONFLICT,
                    ErrorResponse::new("BUSINESS_USER_EXISTS", "User already exists"),
                ),
                BusinessError::InvalidLogin => (
                    StatusCode::UNAUTHORIZED,
                    ErrorResponse::new("BUSINESS_INVALID_LOGIN", "Invalid login credentials"),
                ),
                BusinessError::NotFound => (
                    StatusCode::NOT_FOUND,
                    ErrorResponse::new("BUSINESS_NOT_FOUND", "Resource not found"),
                ),
                BusinessError::RateLimitExceeded => (
                    StatusCode::TOO_MANY_REQUESTS,
                    ErrorResponse::new("RATE_LIMIT_EXCEEDED", "Rate limit exceeded, please try again later"),
                ),
            },
            AppError::External(msg) => (
                StatusCode::BAD_GATEWAY,
                ErrorResponse::new("EXTERNAL_ERROR", msg.clone()),
            ),
            AppError::Database(_) => {
                tracing::error!("Database error: {}", self);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorResponse::new("INTERNAL_ERROR", "Internal server error"),
                )
            }
            AppError::Internal => {
                tracing::error!("Internal error: {}", self);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorResponse::new("INTERNAL_ERROR", "Internal server error"),
                )
            }
            AppError::Config(msg) => {
                tracing::error!("Config error: {}", msg);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorResponse::new("CONFIG_ERROR", "Configuration error"),
                )
            }
        };

        (status, Json(error_response)).into_response()
    }
}

/// Result type alias
pub type Result<T> = std::result::Result<T, AppError>;

// Convert from other error types
impl From<argon2::Error> for AppError {
    fn from(err: argon2::Error) -> Self {
        tracing::error!("Argon2 error: {}", err);
        AppError::Internal
    }
}

impl From<argon2::password_hash::Error> for AppError {
    fn from(err: argon2::password_hash::Error) -> Self {
        tracing::error!("Password hash error: {}", err);
        AppError::Auth(AuthError::InvalidCredentials)
    }
}

impl From<jsonwebtoken::errors::Error> for AppError {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        match err.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
                AppError::Auth(AuthError::TokenExpired)
            }
            _ => {
                tracing::error!("JWT error: {}", err);
                AppError::Auth(AuthError::TokenInvalid)
            }
        }
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        tracing::error!("HTTP client error: {}", err);
        AppError::External("External service request failed".to_string())
    }
}

impl From<csv::Error> for AppError {
    fn from(err: csv::Error) -> Self {
        tracing::error!("CSV parse error: {}", err);
        AppError::External("Data parsing failed".to_string())
    }
}

impl From<scraper::error::SelectorErrorKind<'_>> for AppError {
    fn from(err: scraper::error::SelectorErrorKind<'_>) -> Self {
        tracing::error!("HTML parse error: {}", err);
        AppError::External("Data parsing failed".to_string())
    }
}

impl From<std::num::ParseIntError> for AppError {
    fn from(_: std::num::ParseIntError) -> Self {
        AppError::Validation("Invalid number format".to_string())
    }
}

impl From<std::string::ParseError> for AppError {
    fn from(_: std::string::ParseError) -> Self {
        AppError::Validation("String parsing error".to_string())
    }
}
