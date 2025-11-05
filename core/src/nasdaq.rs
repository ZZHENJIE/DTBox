use crate::RequestResult;
use serde::{Deserialize, Serialize};
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

pub async fn quote(
    client: &reqwest::Client,
    symbol: &str,
) -> Result<RequestResult<Quote>, reqwest::Error> {
    let url = format!(
        "https://api.nasdaq.com/api/quote/{}/info?assetclass=stocks",
        symbol
    );
    let response = client.get(&url).send().await?;
    let quote = response.json::<Quote>().await?;
    Ok(RequestResult::Success(quote))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_quote() {
        let client = reqwest::Client::new();
        let quote = quote(&client, "AAPL").await.unwrap();
        match quote {
            RequestResult::Success(quote) => {
                println!("{:#?}", quote);
            }
            RequestResult::Error(err) => {
                println!("{:#?}", err);
            }
        }
    }
}
