use crate::{Api, AppState, Error};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Default, Deserialize)]
pub struct AkamaiTimeStamp {}

impl Api for AkamaiTimeStamp {
    type Output = u64;
    type Error = Error;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, Self::Error> {
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
