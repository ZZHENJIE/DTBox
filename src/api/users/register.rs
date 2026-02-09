use serde::Deserialize;

use crate::api::{API, Response};

#[derive(Deserialize)]
pub struct RegisterPayload {
    pub name: String,
    pub password: String,
}

impl API for RegisterPayload {
    type Output = bool;
    async fn request(&self, state: std::sync::Arc<crate::app::State>) -> Response<Self::Output> {
        Response::success_with_data(true)
    }
}
