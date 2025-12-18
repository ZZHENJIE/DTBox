use axum::{Json, response::IntoResponse};
use reqwest::StatusCode;

pub enum Error {
    NotFound,
    AuthError(String),
    BadRequest,
    Internal(String),
}

impl From<std::num::ParseIntError> for Error {
    fn from(value: std::num::ParseIntError) -> Self {
        Error::Internal(format!("Parse Error:{}", value))
    }
}

impl From<reqwest::Error> for Error {
    fn from(value: reqwest::Error) -> Self {
        Error::Internal(format!("Reqwest Error:{}", value))
    }
}

impl From<csv::Error> for Error {
    fn from(value: csv::Error) -> Self {
        Error::Internal(format!("CSV Error:{}", value))
    }
}

impl From<serde_json::Error> for Error {
    fn from(value: serde_json::Error) -> Self {
        Error::Internal(format!("Serde JSON Error:{}", value))
    }
}

impl From<scraper::error::SelectorErrorKind<'_>> for Error {
    fn from(value: scraper::error::SelectorErrorKind<'_>) -> Self {
        Error::Internal(format!("Scraper SelectorErrorKind Error:{}", value))
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        use Error::*;
        let (code, message) = match self {
            NotFound => (StatusCode::NOT_FOUND, "Not Found".to_string()),
            AuthError(err) => (StatusCode::UNAUTHORIZED, err),
            BadRequest => (StatusCode::BAD_REQUEST, "Bad Request".to_string()),
            Internal(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
        };
        let body = Json(serde_json::json!({ "error": message }));
        (code, body).into_response()
    }
}
