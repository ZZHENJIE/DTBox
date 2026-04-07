use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;

/// Unified API response structure
#[derive(Serialize, Debug, Clone)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

/// JSON response wrapper
pub struct JsonResponse<T>(pub ApiResponse<T>);

impl<T: Serialize> JsonResponse<T> {
    /// Create success response
    pub fn success(data: T) -> Self {
        Self(ApiResponse {
            success: true,
            data: Some(data),
            message: None,
        })
    }

    /// Create success response with message
    pub fn success_with_message(data: T, message: impl Into<String>) -> Self {
        Self(ApiResponse {
            success: true,
            data: Some(data),
            message: Some(message.into()),
        })
    }

    /// Create empty success response
    pub fn ok() -> JsonResponse<()> {
        JsonResponse(ApiResponse {
            success: true,
            data: None,
            message: None,
        })
    }

    /// Create empty success response with message
    pub fn ok_with_message(message: impl Into<String>) -> JsonResponse<()> {
        JsonResponse(ApiResponse {
            success: true,
            data: None,
            message: Some(message.into()),
        })
    }
}

impl<T: Serialize> IntoResponse for JsonResponse<T> {
    fn into_response(self) -> Response {
        (StatusCode::OK, Json(self.0)).into_response()
    }
}
