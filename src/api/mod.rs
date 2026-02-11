pub mod register;
pub mod response;
pub mod users;

use std::sync::Arc;

use axum::{
    Json,
    extract::{Query, State},
};
pub use response::Response;
use serde::de::DeserializeOwned;

pub trait API: Send + Sync {
    type Output: serde::Serialize;
    fn request(
        &self,
        state: std::sync::Arc<crate::app::State>,
    ) -> impl std::future::Future<Output = Response<Self::Output>> + Send;
}

pub async fn post<T>(
    State(state): State<Arc<crate::app::State>>,
    Json(payload): Json<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    payload.request(state).await
}

pub async fn get<T>(
    State(state): State<Arc<crate::app::State>>,
    Query(input): Query<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    input.request(state).await
}
