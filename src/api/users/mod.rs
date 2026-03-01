pub mod exists; // 查询用户名(用户)是否已经存在
pub mod follow_change; // 添加关注
pub mod info; // 获取用户信息
pub mod login; // 用户登录
pub mod name_change; // 修改用户名
pub mod refresh; // 刷新JWT
pub mod register; // 用户注册

use crate::{api, app, utils::jwt::Claims};
use axum::{
    extract::Request,
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use std::sync::Arc;

type Router = axum::Router<Arc<app::State>>;

pub fn register() -> Router {
    // 需要JWT认证的接口
    let protected_router = Router::new()
        .route(
            "/api/users/info",
            get(api::handler::get_auth::<info::Output>),
        )
        .route(
            "/api/users/follow_change",
            post(api::handler::post_auth::<follow_change::Payload>),
        )
        .route(
            "/api/users/name_change",
            post(api::handler::post_auth::<name_change::Payload>),
        )
        .route_layer(middleware::from_fn(auth));
    // 正常接口
    let public_router = Router::new()
        .route(
            "/api/users/register",
            post(api::handler::post::<register::Payload>),
        )
        .route(
            "/api/users/login",
            post(api::handler::post::<login::Payload>),
        )
        .route(
            "/api/users/refresh",
            post(api::handler::post::<refresh::Payload>),
        )
        .route("/api/users/exists", get(api::handler::get::<exists::Query>));
    Router::new().merge(protected_router).merge(public_router)
}

async fn auth(mut req: Request, next: Next) -> Response {
    if let Some(token) = req.headers().get("Token") {
        return match Claims::decode(token.as_bytes()) {
            Ok(claims) => {
                req.extensions_mut().insert(claims);
                next.run(req).await
            }
            Err(err) => api::Response::<()>::error(err.to_string()).into_response(),
        };
    }
    api::Response::<()>::error("Not Found Token!").into_response()
}
