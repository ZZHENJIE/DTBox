pub mod exists;
pub mod login;
pub mod refresh;
pub mod register;
pub mod test;

use std::sync::Arc;

use crate::{api, app, utils::jwt::Claims};
use axum::{
    extract::Request,
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};

type Router = axum::Router<Arc<app::State>>;

pub fn register() -> Router {
    // 需要JWT认证的接口
    let protected_router = Router::new()
        .route("/api/users/test", post(api::post::<test::TestPayload>))
        .route_layer(middleware::from_fn(auth));
    // 正常接口
    let public_router = Router::new()
        .route(
            "/api/users/register",
            post(api::post::<register::RegisterPayload>),
        )
        .route("/api/users/login", post(api::post::<login::LoginPayload>))
        .route(
            "/api/users/refresh",
            post(api::post::<refresh::RefreshPayload>),
        )
        .route("/api/users/exists", get(api::get::<exists::ExistsQuery>));
    Router::new().merge(protected_router).merge(public_router)
}

async fn auth(req: Request, next: Next) -> Response {
    if let Some(token) = req.headers().get("Token") {
        return match Claims::decode(token.as_bytes()) {
            Ok(_) => next.run(req).await,
            Err(err) => api::Response::<()>::error(err.to_string()).into_response(),
        };
    }
    api::Response::<()>::error("Not Found Token!").into_response()
}
