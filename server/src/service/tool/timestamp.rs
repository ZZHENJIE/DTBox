pub async fn akamai(client: &reqwest::Client) -> Result<u64, String> {
    let response = client
        .get("https://time.akamai.com")
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    let text = response
        .text()
        .await
        .map_err(|e| format!("Response body error: {}", e))?;
    text.trim()
        .parse::<u64>()
        .map_err(|e| format!("Parse error: {}", e))
}
