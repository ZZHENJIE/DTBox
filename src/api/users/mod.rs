pub mod login;
pub mod name_is_exists;
pub mod refresh;
pub mod register;
pub mod test;

use crate::api;
use axum::routing::{get, post};

type Router = axum::Router<std::sync::Arc<crate::app::State>>;

pub fn register(router: Router) -> Router {
    router
        .route(
            "/api/users/register",
            post(api::post::<register::RegisterPayload>),
        )
        .route("/api/users/login", post(api::post::<login::LoginPayload>))
        .route(
            "/api/users/refresh",
            post(api::post::<refresh::RefreshPayload>),
        )
        .route("/api/users/test", post(api::post::<test::TestPayload>))
        .route(
            "/api/users/name_is_exists",
            get(api::get::<name_is_exists::NameIsExistsQuery>),
        )
}
