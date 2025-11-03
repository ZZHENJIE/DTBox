pub async fn test_request(client: reqwest::Client) -> Result<String, reqwest::Error> {
    reqwest::get("https://example.com/")
        .await
        .unwrap()
        .text()
        .await
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn test_test_request() {
        let client = reqwest::Client::new();
        let response = test_request(client).await.unwrap();
        assert_eq!(response, "Hello, world!");
    }
}
