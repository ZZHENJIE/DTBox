use crate::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Default, Serialize, Deserialize)]
pub struct AkamaiTimeStamp {}

impl crate::data_source::Source for AkamaiTimeStamp {
    type Output = u64;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, anyhow::Error> {
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
