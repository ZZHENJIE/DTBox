use crate::{Api, AppState, Error};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct ScreenerItem {
    #[serde(rename = "No.")]
    pub number: u32,
    #[serde(rename = "Ticker")]
    pub symbol: String,
    #[serde(rename = "Company")]
    pub company: String,
    #[serde(rename = "Sector")]
    pub sector: String,
    #[serde(rename = "Industry")]
    pub industry: String,
    #[serde(rename = "Country")]
    pub country: String,
    #[serde(rename = "Market Cap")]
    pub market_cap: Option<f64>,
    #[serde(rename = "P/E")]
    pub p_e: Option<f32>,
    #[serde(rename = "Price")]
    pub price: Option<f32>,
    #[serde(rename = "Change")]
    pub change: String,
    #[serde(rename = "Volume")]
    pub volume: Option<u64>,
}

#[derive(Default, Deserialize)]
pub struct ScreenerFinviz {
    pub query: String,
}

impl Api for ScreenerFinviz {
    type Output = Vec<ScreenerItem>;
    type Error = Error;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, Self::Error> {
        let url = format!(
            "https://elite.finviz.com/export.ashx?v=111&f={}&auth={}",
            self.query,
            state.settings().finviz.auto_token
        );
        let response = state.http_client().get(&url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<ScreenerItem> = Vec::new();
        for result in rdr.deserialize() {
            let record: ScreenerItem = result?;
            items.push(record);
        }
        Ok(items)
    }
}
