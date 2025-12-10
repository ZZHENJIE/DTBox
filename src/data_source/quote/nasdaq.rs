use crate::AppState;
use serde::{Deserialize, Serialize};
use std::{fmt, sync::Arc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Quote {
    pub data: Data,
    pub message: Option<serde_json::Value>,
    pub status: Status,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Data {
    pub symbol: String,
    pub company_name: String,
    pub stock_type: String,
    pub exchange: String,
    pub is_nasdaq_listed: bool,
    pub is_nasdaq100: bool,
    pub is_held: bool,
    pub primary_data: PrimaryData,
    pub secondary_data: Option<serde_json::Value>,
    pub market_status: String,
    pub asset_class: String,
    pub key_stats: KeyStats,
    pub notifications: Vec<Option<serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyStats {
    pub fifty_two_week_high_low: Dayrange,
    pub dayrange: Dayrange,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Dayrange {
    pub label: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrimaryData {
    pub last_sale_price: String,
    pub net_change: String,
    pub percentage_change: String,
    pub delta_indicator: String,
    pub last_trade_timestamp: String,
    pub is_real_time: bool,
    pub bid_price: String,
    pub ask_price: String,
    pub bid_size: String,
    pub ask_size: String,
    pub volume: String,
    pub currency: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub r_code: i64,
    pub b_code_message: Option<serde_json::Value>,
    pub developer_message: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Asset {
    STOCK,
    ETF,
}

impl Default for Asset {
    fn default() -> Self {
        Asset::STOCK
    }
}

impl fmt::Display for Asset {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Asset::ETF => "etf",
            Asset::STOCK => "stocks",
        })
    }
}

#[derive(Default, Serialize, Deserialize)]
pub struct QuoteNasdaq {
    pub symbol: String,
    pub asset: Asset,
}

impl crate::data_source::Source for QuoteNasdaq {
    type Output = Quote;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, anyhow::Error> {
        let url = format!(
            "https://api.nasdaq.com/api/quote/{}/info?assetclass={}",
            self.symbol,
            self.asset.to_string()
        );
        let response = state.http_client().get(&url).send().await?;
        let quote = response.json::<Quote>().await?;
        Ok(quote)
    }
}
