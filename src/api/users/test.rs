use serde::Deserialize;

use crate::{
    api::{API, Response},
    utils::jwt::Claims,
};

#[derive(Deserialize)]
pub struct TestPayload {
    pub token: String,
}

impl API for TestPayload {
    type Output = String;
    async fn request(
        &self,
        _: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        Response::success_with_data("Hello".into())
    }
}
