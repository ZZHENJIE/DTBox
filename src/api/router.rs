use crate::api::{Response, users};
use axum::routing::get;

type Router = axum::Router<std::sync::Arc<crate::app::State>>;

fn version() -> Router {
    Router::new().route(
        "/api/version",
        get(async || Response::success_with_data(env!("CARGO_PKG_VERSION"))),
    )
}

pub fn register() -> Router {
    axum::Router::new()
        .merge(version()) // 版本接口
        .merge(users::register()) // 用户接口
}
