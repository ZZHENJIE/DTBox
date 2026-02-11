use axum::{http::HeaderValue, response::IntoResponse};
use cookie::{Cookie, time::Duration};
use serde::Serialize;
use tracing::error;

#[derive(Debug, Serialize)]
pub struct Response<T: Serialize> {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
}

impl<T: Serialize> Response<T> {
    pub fn success() -> Self {
        Self {
            code: 0,
            message: "success".to_string(),
            data: None,
            refresh_token: None,
        }
    }

    pub fn success_with_data(data: T) -> Self {
        Self {
            code: 0,
            message: "success".to_string(),
            data: Some(data),
            refresh_token: None,
        }
    }

    pub fn success_with_token(data: T, refresh_token: String) -> Self {
        Self {
            code: 0,
            message: "success".to_string(),
            data: Some(data),
            refresh_token: Some(refresh_token),
        }
    }

    pub fn error(message: impl Into<String>) -> Self {
        Self {
            code: -1,
            message: message.into(),
            data: None,
            refresh_token: None,
        }
    }

    pub fn error_with_code(code: i32, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            data: None,
            refresh_token: None,
        }
    }
}

impl<T: Serialize> IntoResponse for Response<T> {
    fn into_response(self) -> axum::response::Response {
        let mut resp = axum::Json(&self).into_response();

        #[cfg(not(debug_assertions))]
        let secure = true;

        #[cfg(debug_assertions)]
        let secure = false;

        if let Some(token) = &self.refresh_token {
            let cookie = Cookie::build(("refresh_token", token.clone()))
                .http_only(true)
                .secure(secure)
                .same_site(cookie::SameSite::Lax)
                .path("/")
                .max_age(Duration::days(7))
                .build();

            let value: HeaderValue = cookie.to_string().parse().unwrap_or_else(|err| {
                error!("HeaderValue parse error: {}", err);
                HeaderValue::from_static("None")
            });

            resp.headers_mut().insert("Set-Cookie", value);
        }

        resp
    }
}
