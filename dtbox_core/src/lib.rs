pub async fn test_request() -> Result<String, reqwest::Error> {
    reqwest::get("https://example.com/")
        .await
        .unwrap()
        .text()
        .await
}
