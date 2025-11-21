use axum::{Json, response::IntoResponse};
use reqwest::StatusCode;

pub enum Error {
    NotFound,
    BadRequest(String),
    Internal,
    DataBase(sqlx::Error),
}

impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        let (code, message) = match self {
            Error::NotFound => (StatusCode::NOT_FOUND, "Not Found".to_string()),
            Error::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            Error::Internal => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal Server Error".to_string(),
            ),
            Error::DataBase(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database Error: {}", err.to_string()),
            ),
        };
        let body = Json(serde_json::json!({ "error": message }));
        (code, body).into_response()
    }
}
