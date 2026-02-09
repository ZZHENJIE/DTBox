use axum::routing::{get, post};

use crate::api::{self, Response, users};

type Router = axum::Router<std::sync::Arc<crate::app::State>>;

pub fn result(router: Router) -> Router {
    let router = version(router);
    let router = users(router);
    router
}

fn version(router: Router) -> Router {
    router.route(
        "/api/version",
        get(async || Response::success_with_data(env!("CARGO_PKG_VERSION"))),
    )
}

fn users(router: Router) -> Router {
    router.route(
        "/api/users/register",
        post(api::post::<users::register::RegisterPayload>),
    )
}
