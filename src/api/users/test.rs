use serde::Deserialize;

use crate::api::{API, Response};

#[derive(Deserialize)]
pub struct Payload {
    pub token: String,
}

impl API for Payload {
    type Output = String;
    async fn request(
        &self,
        claims: Option<crate::utils::jwt::Claims>,
        _: std::sync::Arc<crate::app::State>,
    ) -> Response<Self::Output> {
        if let Some(claims) = claims {
            println!("{:#?}", claims.sub_data());
            return Response::success_with_data("Hello".into());
        }
        Response::error("Claims is None.")
    }
}
