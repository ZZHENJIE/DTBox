use crate::{market::Cboe, RequestResult};
use serde::Deserialize;

#[derive(Debug)]
pub struct Quote {
    pub market: Cboe,
    pub items: Vec<QuoteItem>,
}

#[derive(Debug, Deserialize)]
pub struct QuoteItem {
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

pub async fn quote(
    client: &reqwest::Client,
    market: Cboe,
) -> Result<RequestResult<Quote>, reqwest::Error> {
    let url = format!(
        "https://www.cboe.com/us/equities/market_statistics/symbol_data/csv/?mkt={}",
        market.to_string()
    );
    let response = client.get(&url).send().await?;
    let quote_csv = response.text().await?;
    let mut quote = Quote {
        market,
        items: vec![],
    };
    let mut rdr = csv::Reader::from_reader(quote_csv.as_bytes());
    for result in rdr.deserialize() {
        let record: QuoteItem = match result {
            Ok(result) => result,
            Err(err) => return Ok(RequestResult::Error(err.to_string())),
        };
        quote.items.push(record);
    }
    Ok(RequestResult::Success(quote))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_market_quote() {
        let client = reqwest::Client::new();
        let market = Cboe::EDGX;
        let quote = quote(&client, market).await.unwrap();
        match quote {
            RequestResult::Success(quote) => {
                println!("{:#?}", quote.items[0]);
            }
            RequestResult::Error(err) => {
                println!("{:#?}", err);
            }
        }
    }
}
