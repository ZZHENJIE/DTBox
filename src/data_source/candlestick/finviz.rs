use crate::{Api, AppState, Error};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    #[serde(rename = "Date")]
    pub date: String,
    #[serde(rename = "Open")]
    pub open: f32,
    #[serde(rename = "High")]
    pub high: f32,
    #[serde(rename = "Low")]
    pub low: f32,
    #[serde(rename = "Close")]
    pub close: f32,
    #[serde(rename = "Volume")]
    pub volume: u64,
}

#[derive(Default, Deserialize)]
pub struct CandlestickFinviz {
    pub symbol: String,
    pub interval: String, // i1 | i3 | i5
    pub space: String,    // d1 | d5 | m1 | m3 | m6 | ytd | y1 | y2 | y5 | max
}

impl CandlestickFinviz {
    pub fn url(&self, auth: &str) -> String {
        format!(
            "https://elite.finviz.com/quote_export.ashx?t={}&p={}&r={}&auth={}",
            self.symbol, self.interval, self.space, auth
        )
    }
}

impl Api for CandlestickFinviz {
    type Output = Vec<Item>;
    type Error = Error;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, Self::Error> {
        let url = self.url(&state.settings().finviz.auto_token);
        let response = state.http_client().get(url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<Item> = Vec::new();
        for result in rdr.deserialize() {
            let record: Item = result?;
            items.push(record);
        }
        Ok(items)
    }
}
