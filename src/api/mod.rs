pub mod handler;
pub mod response;
pub mod users;

pub use response::Response;

use crate::{app, utils::jwt};
use std::sync::Arc;

pub trait API: Send + Sync {
    type Output: serde::Serialize;
    fn request(
        &self,
        claims: Option<jwt::Claims>,
        state: std::sync::Arc<app::State>,
    ) -> impl std::future::Future<Output = Response<Self::Output>> + Send;
}

pub fn register() -> axum::Router<Arc<app::State>> {
    axum::Router::new().route(
        "/api/version",
        axum::routing::get(async || Response::success_with_data(env!("CARGO_PKG_VERSION"))),
    )
}
