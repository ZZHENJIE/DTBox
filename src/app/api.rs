use crate::AppState;
use axum::{
    Json,
    extract::{Query, State},
    response::IntoResponse,
};
use serde::{Serialize, de::DeserializeOwned};
use std::sync::Arc;

pub trait Api: Send + Sync {
    type Error: IntoResponse;
    type Output: Serialize;
    fn fetch(
        &self,
        state: Arc<AppState>,
    ) -> impl std::future::Future<Output = Result<Self::Output, Self::Error>> + Send;
}

pub async fn post<A>(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<A>,
) -> Result<Json<A::Output>, A::Error>
where
    A: Api + DeserializeOwned + Sized,
{
    payload.fetch(state).await.map(Json)
}

pub async fn get<A>(
    State(state): State<Arc<AppState>>,
    Query(input): Query<A>,
) -> Result<Json<A::Output>, A::Error>
where
    A: Api + DeserializeOwned + Sized,
{
    input.fetch(state).await.map(Json)
}
