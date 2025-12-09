use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    #[serde(rename = "ticker")]
    pub symbol: String,
    pub timeframe: String,
    pub volume: Vec<i64>,
    pub date: Vec<i64>,
    pub open: Vec<f32>,
    pub high: Vec<f32>,
    pub low: Vec<f32>,
    pub close: Vec<f32>,
    pub last_open: f64,
    pub last_high: f64,
    pub last_low: f64,
    pub last_close: f64,
    pub last_volume: i64,
    pub data_id: String,
    pub last_date: i64,
    pub last_time: i64,
    pub prev_close: f64,
    pub after_close: Option<f64>,
    pub after_change: Option<f64>,
    pub after_time: Option<i64>,
    pub update_ohlc_version: i64,
    pub chart_events: Vec<Option<serde_json::Value>>,
}

#[derive(Default, Serialize, Deserialize)]
pub struct QuoteFinviz {
    pub symbol: String,
    pub date_from: Option<u64>,
}

impl crate::data_source::Source for QuoteFinviz {
    type Output = Quote;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let date_from = self.date_from.unwrap_or_else(|| {
            let now = SystemTime::now();
            let duration = now
                .duration_since(UNIX_EPOCH)
                .expect("clock went backwards");
            duration.as_secs()
        });
        let url = format!(
            "https://api.finviz.com/api/quote.ashx?dateFrom={}&instrument=stock&ticker={}&timeframe=d",
            date_from, self.symbol
        );
        let response = client.get(url).send().await?;
        let quote: Quote = response.json().await?;
        Ok(quote)
    }
}

#[cfg(test)]
mod tests {
    use crate::data_source::Source;

    use super::*;

    #[tokio::test]
    async fn test_result() {
        let client = reqwest::Client::new();
        let quote_finviz = QuoteFinviz {
            symbol: "AAPL".to_string(),
            date_from: None,
        };
        let result = quote_finviz.fetch(&client).await;
        println!("{:#?}", result);
    }
}
