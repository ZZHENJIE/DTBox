pub async fn tradingview_economic(
    client: &reqwest::Client,
    query: shared::CalendarEconomicQuery,
) -> Result<Vec<shared::TradingviewEconomicCalendarItem>, String> {
    let from_str = query.from.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
    let to_str = query.to.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
    let url = format!(
        "https://economic-calendar.tradingview.com/events?from={}&to={}&countries=US",
        from_str, to_str
    );
    let response = client
        .get(&url)
        .header("Origin", "https://www.tradingview.com")
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let object: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    let status = object
        .get("status")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Response missing status field".to_string())?;

    if status != "ok" {
        return Err(format!("API error: {}", status));
    }

    let result = object
        .get("result")
        .ok_or_else(|| "Response missing result field".to_string())?;

    serde_json::from_value(result.clone()).map_err(|e| format!("Deserialize error: {}", e))
}
