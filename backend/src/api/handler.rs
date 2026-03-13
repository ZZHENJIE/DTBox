use crate::{
    api::{API, Response},
    app,
    utils::jwt,
};
use axum::{
    Extension, Json,
    extract::{Query, State},
};
use serde::de::DeserializeOwned;
use std::sync::Arc;

pub async fn post_auth<T>(
    Extension(claims): Extension<jwt::Claims>,
    State(state): State<Arc<app::State>>,
    Json(payload): Json<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    payload.request(Some(claims), state).await
}

pub async fn post<T>(
    State(state): State<Arc<app::State>>,
    Json(payload): Json<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    payload.request(None, state).await
}

pub async fn get_auth<T>(
    Extension(claims): Extension<jwt::Claims>,
    State(state): State<Arc<app::State>>,
    Query(input): Query<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    input.request(Some(claims), state).await
}

pub async fn get<T>(
    State(state): State<Arc<app::State>>,
    Query(input): Query<T>,
) -> Response<T::Output>
where
    T: API + DeserializeOwned + Sized,
{
    input.request(None, state).await
}
