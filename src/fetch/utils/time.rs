pub async fn akamai_stamper(client: &reqwest::Client) -> anyhow::Result<u64, anyhow::Error> {
    let response = client.get("https://time.akamai.com").send().await?;
    let response_text = response.text().await?;
    let time = response_text.parse::<u64>()?;
    Ok(time)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_time_stamper() {
        let client = reqwest::Client::new();
        let result = akamai_stamper(&client).await.unwrap();
        println!("{:#?}", result);
    }
}
