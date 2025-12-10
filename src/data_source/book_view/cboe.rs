use crate::{AppState, utils::market::Cboe};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Deserialize, Serialize)]
pub struct Item {
    #[serde(rename = "Name")]
    pub symbol: String,
    #[serde(rename = "Volume")]
    pub volume: u64,
    #[serde(rename = "Ask Size")]
    pub ask_size: u32,
    #[serde(rename = "Ask Price")]
    pub ask_price: f64,
    #[serde(rename = "Bid Size")]
    pub bid_size: u32,
    #[serde(rename = "Bid Price")]
    pub bid_price: f64,
    #[serde(rename = "Last Price")]
    pub last_price: f64,
    #[serde(rename = "Shares Matched")]
    pub shares_matched: u64,
    #[serde(rename = "Shares Routed")]
    pub shares_routed: u64,
}

#[derive(Default, Deserialize, Serialize)]
pub struct BookViewCboe {
    pub market: Cboe,
}

impl crate::data_source::Source for BookViewCboe {
    type Output = Vec<Item>;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, anyhow::Error> {
        let url = format!(
            "https://www.cboe.com/us/equities/market_statistics/symbol_data/csv/?mkt={}",
            self.market.to_string()
        );
        let response = state.http_client().get(&url).send().await?;
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
