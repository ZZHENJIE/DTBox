pub mod change; // 信息修改
pub mod exists; // 查询用户名(用户)是否已经存在
pub mod info; // 获取用户信息
pub mod login; // 用户登录
pub mod refresh; // 刷新JWT
pub mod register; // 用户注册

use crate::{api, app, utils::jwt::Claims};
use axum::{
    extract::Request,
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use axum_extra::extract::CookieJar;
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
            "/api/users/change",
            post(api::handler::post_auth::<change::Event>),
        )
        .route_layer(middleware::from_fn(jwt_auth));
    // 刷新接口
    let refresh = Router::new()
        .route("/api/users/refresh", post(refresh::request))
        .route_layer(middleware::from_fn(refresh_auth));
    // 正常接口
    let public_router = Router::new()
        .route(
            "/api/users/register",
            post(api::handler::post::<register::Payload>),
        )
        .route("/api/users/login", post(login::request))
        .route("/api/users/exists", get(api::handler::get::<exists::Query>));
    Router::new()
        .merge(protected_router)
        .merge(public_router)
        .merge(refresh)
}

async fn jwt_auth(mut req: Request, next: Next) -> Response {
    if let Some(auth_str) = req.headers().get("Authorization") {
        let token = match auth_str.as_bytes().strip_prefix(b"Bearer ") {
            Some(value) => value,
            None => {
                return api::Response::<()>::error_with_code(-101, "Invalid Token Format!")
                    .into_response();
            }
        };
        return match Claims::decode(token) {
            Ok(claims) => {
                req.extensions_mut().insert(claims);
                next.run(req).await
            }
            Err(err) => api::Response::<()>::error_with_code(-103, err.to_string()).into_response(),
        };
    }
    api::Response::<()>::error_with_code(-102, "Not Found Token!").into_response()
}

async fn refresh_auth(mut req: Request, next: Next) -> Response {
    let jar = CookieJar::from_headers(req.headers());
    req.extensions_mut().insert(jar);
    next.run(req).await
}
