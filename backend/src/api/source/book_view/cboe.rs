use crate::api::API;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Deserialize)]
pub enum Market {
    EDGA,
    EDGX,
    BYX,
    BZX,
}

impl ToString for Market {
    fn to_string(&self) -> String {
        match self {
            Market::EDGA => "edga".to_string(),
            Market::EDGX => "edgx".to_string(),
            Market::BYX => "byx".to_string(),
            Market::BZX => "bzx".to_string(),
        }
    }
}

#[derive(Deserialize)]
pub struct BookViewCboe {
    pub market: Market,
}

impl API for BookViewCboe {
    type Output = Vec<Item>;

    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        let url = format!(
            "https://www.cboe.com/us/equities/market_statistics/symbol_data/csv/?mkt={}",
            self.market.to_string()
        );
        let response = state.http_client().get(&url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<Item> = Vec::new();
        for result in rdr.deserialize() {
            items.push(result?);
        }
        Ok(items)
    }
}
