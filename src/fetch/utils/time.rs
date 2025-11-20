use crate::RequestResult;

pub async fn akamai_stamper(
    client: &reqwest::Client,
) -> Result<RequestResult<u64>, reqwest::Error> {
    let response = client.get("https://time.akamai.com").send().await?;
    let response_text = response.text().await?;
    return match response_text.parse::<u64>() {
        Ok(time_stamper) => Ok(RequestResult::Success(time_stamper)),
        Err(err) => Ok(RequestResult::Error(err.to_string())),
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_time_stamper() {
        let client = reqwest::Client::new();
        let result = akamai_stamper(&client).await.unwrap();
        match result {
            RequestResult::Success(result) => {
                println!("{:#?}", result);
            }
            RequestResult::Error(err) => {
                println!("{:#?}", err);
            }
        }
    }
}
