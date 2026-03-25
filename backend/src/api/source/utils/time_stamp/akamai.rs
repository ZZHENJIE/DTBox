use serde::Deserialize;

use crate::api::API;

#[derive(Default, Deserialize)]
pub struct AkamaiTimeStamp {}

impl API for AkamaiTimeStamp {
    type Output = u64;

    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        let response = state
            .http_client()
            .get("https://time.akamai.com")
            .send()
            .await?;
        let response_text = response.text().await?;
        let time = response_text.parse::<u64>()?;
        Ok(time)
    }
}
