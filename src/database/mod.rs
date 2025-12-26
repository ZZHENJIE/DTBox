use crate::{AppState, app::api};
use axum::routing;
use std::sync::Arc;

pub mod user {
    // pub mod auth;
    pub mod jwt;
    pub mod name_is_exists;
    pub mod operation;
    // pub mod profile;
    pub mod register;
    pub mod signin;
}

pub fn router(router: axum::Router<Arc<AppState>>) -> axum::Router<Arc<AppState>> {
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
}
