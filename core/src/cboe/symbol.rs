use crate::{Market, RequestResult};
use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct QuoteData {
    pub symbol: String,
    pub auction: bool,
    pub company: String,
    pub prev: f64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub last: f64,
    pub change: f64,
    pub volume: i64,
    #[serde(rename = "ordersOrTrades")]
    pub orders_or_trades: i64,
    pub asks: Vec<Option<serde_json::Value>>,
    pub bids: Vec<Option<serde_json::Value>>,
    pub trades: Vec<Vec<String>>,
    pub timestamp: String,
    pub tick_type: String,
    pub status: String,
}

pub async fn quote(
    client: &reqwest::Client,
    market: Market,
    symbol: &str,
) -> Result<RequestResult<QuoteData>, reqwest::Error> {
    let url = format!(
        "https://www.cboe.com/json/{}/book/{}",
        market.to_string(),
        symbol
    );
    let response = client
        .get(&url)
        .header(
            "referer",
            "https://www.cboe.com/us/equities/market_statistics/book_viewer/",
        )
        .send()
        .await?;
    let object: serde_json::Value = response.json().await?;
    let mut result = QuoteData::default();
    if let Some(data_value) = object.get("data") {
        result = match serde_json::from_value::<QuoteData>(data_value.clone()) {
            Ok(data) => data,
            Err(err) => return Ok(RequestResult::Error(err.to_string())),
        };
    }
    Ok(RequestResult::Success(result))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_symbol_quote() {
        let client = reqwest::Client::new();
        let market = Market::EDGX;
        let symbol = "AAPL";
        let quote = quote(&client, market, symbol).await.unwrap();
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
