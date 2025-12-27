use std::sync::Arc;

use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use reqwest::StatusCode;

use crate::{AppState, database::user::jwt};

pub async fn auth(
    State(state): State<Arc<AppState>>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let token = match auth_header.and_then(|h| h.strip_prefix("Bearer ")) {
        Some(t) => t,
        None => return Err(StatusCode::UNAUTHORIZED),
    };

    let claims = jwt::Claims::decode(token, state.settings().server.jwt_secret.as_bytes());

    match claims {
        Ok(value) => {
            let now = chrono::Utc::now().timestamp() as usize;
            if value.exp < now {
                return Err(StatusCode::UNAUTHORIZED);
            }
            request.extensions_mut().insert(value.sub);
            Ok(next.run(request).await)
        }
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}
