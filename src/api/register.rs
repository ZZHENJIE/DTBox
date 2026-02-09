use crate::api::{Response, users};
use axum::routing::get;

type Router = axum::Router<std::sync::Arc<crate::app::State>>;

pub fn result(router: Router) -> Router {
    let router = version(router);
    let router = users::register(router);
    router
}

fn version(router: Router) -> Router {
    router.route(
        "/api/version",
        get(async || Response::success_with_data(env!("CARGO_PKG_VERSION"))),
    )
}
