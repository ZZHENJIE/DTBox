use serde::{Deserialize, Serialize};

#[derive(Default, Serialize, Deserialize)]
pub struct AkamaiTimeStamp {}

impl crate::data_source::Source for AkamaiTimeStamp {
    type Output = u64;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let response = client.get("https://time.akamai.com").send().await?;
        let response_text = response.text().await?;
        let time = response_text.parse::<u64>()?;
        Ok(time)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data_source::Source;

    #[tokio::test]
    async fn test_time_stamper() {
        let client = reqwest::Client::new();
        let akamai_time_stamp = AkamaiTimeStamp::default();
        let result = akamai_time_stamp.fetch(&client).await;
        println!("{:#?}", result);
    }
}
