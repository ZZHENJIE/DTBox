pub mod response;
pub mod users;

use crate::app;
use axum::{
    Json,
    extract::{Query, State},
};
pub use response::Response;
use serde::de::DeserializeOwned;
use std::sync::Arc;

pub trait API: Send + Sync {
    type Output: serde::Serialize;
    fn request(
        &self,
        state: std::sync::Arc<app::State>,
    ) -> impl std::future::Future<Output = Response<Self::Output>> + Send;
}

pub async fn post<T>(
    State(state): State<Arc<app::State>>,
    Json(payload): Json<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    payload.request(state).await
}

pub async fn get<T>(
    State(state): State<Arc<app::State>>,
    Query(input): Query<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    input.request(state).await
}

pub fn register() -> axum::Router<Arc<app::State>> {
    axum::Router::new().route(
        "/api/version",
        axum::routing::get(async || Response::success_with_data(env!("CARGO_PKG_VERSION"))),
    )
}
