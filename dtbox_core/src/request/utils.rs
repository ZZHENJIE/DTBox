pub async fn time_stamper(client: &reqwest::Client) -> Result<String, reqwest::Error> {
    let response = client.get("https://time.akamai.com").send().await?;
    let response_text = response.text().await?;
    Ok(response_text)
}
