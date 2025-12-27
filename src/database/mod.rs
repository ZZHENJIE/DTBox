use crate::{
    AppState,
    app::api,
    database::user::{auth, profile},
};
use axum::{Router, middleware, routing};
use std::sync::Arc;

pub mod user {
    // pub mod auth;
    // pub mod jwt;
    // pub mod name_is_exists;
    // pub mod operation;
    // pub mod profile;
    // pub mod register;
    // pub mod signin;
}

pub fn router(
    router: axum::Router<Arc<AppState>>,
    state: Arc<AppState>,
) -> axum::Router<Arc<AppState>> {
    let protected = Router::new()
        .route("/api/user/profile", routing::get(profile::fetch))
        .route_layer(middleware::from_fn_with_state(state.clone(), auth::auth));
    router
        .route(
            "/api/user/register",
            routing::post(api::post::<user::register::Register>),
        )
        .route(
            "/api/user/signin",
            routing::post(api::post::<user::signin::Signin>),
        )
        .route(
            "/api/user/name_is_exists",
            routing::post(api::post::<user::name_is_exists::NameIsExists>),
        )
        .merge(protected)
}
