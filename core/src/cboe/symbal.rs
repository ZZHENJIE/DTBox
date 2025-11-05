use crate::{Market, RequestResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Quote {
    pub success: bool,
    pub reload: String,
    pub data: Data,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Data {
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
    symbal: &str,
) -> Result<RequestResult<Quote>, reqwest::Error> {
    let url = format!(
        "https://www.cboe.com/json/{}/book/{}",
        market.to_string(),
        symbal
    );
    let response = client
        .get(&url)
        .header(
            "referer",
            "https://www.cboe.com/us/equities/market_statistics/book_viewer/",
        )
        .send()
        .await?;
    let quote = response.json::<Quote>().await?;
    Ok(RequestResult::Success(quote))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_symbal_quote() {
        let client = reqwest::Client::new();
        let market = Market::EDGX;
        let symbal = "AAPL";
        let quote = quote(&client, market, symbal).await.unwrap();
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
