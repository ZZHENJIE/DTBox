use axum::response::IntoResponse;
use serde::Serialize;

use crate::utils;

#[derive(Serialize)]
pub struct Response<T: Serialize> {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}

impl<T: Serialize> IntoResponse for Response<T> {
    fn into_response(self) -> axum::response::Response {
        axum::Json(&self).into_response()
    }
}

impl<T: Serialize> From<Result<T, utils::error::Error>> for Response<T> {
    fn from(value: Result<T, utils::error::Error>) -> Self {
        match value {
            Ok(data) => Response {
                code: 0,
                message: "success".to_string(),
                data: Some(data),
            },
            Err(err) => Response {
                code: err.code.into(),
                message: err.message,
                data: None,
            },
        }
    }
}
