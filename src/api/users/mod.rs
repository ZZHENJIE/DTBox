pub mod exists;
pub mod login;
pub mod refresh;
pub mod register;
pub mod test;

use crate::api::{self, Response};
use axum::{
    extract::Request,
    middleware::{self, Next},
    routing::{get, post},
};

type Router = axum::Router<std::sync::Arc<crate::app::State>>;

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

async fn auth(req: Request, _: Next) -> Response<String> {
    println!("{:#?}", req.uri());

    Response::success_with_data(req.uri().to_string())
}
