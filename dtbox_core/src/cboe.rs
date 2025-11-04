use crate::RequestResult;
use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub enum Market {
    BYX,
    BZX,
    EDGA,
    EDGX,
}

impl Market {
    fn to_string(&self) -> &'static str {
        match self {
            Market::BYX => "byx",
            Market::BZX => "bzx",
            Market::EDGA => "edga",
            Market::EDGX => "edgx",
        }
    }
}

#[derive(Debug)]
pub struct MarketQuote {
    pub market: Market,
    pub items: Vec<MarketQuoteItem>,
}

#[derive(Debug)]
pub struct MarketQuoteItem {
    pub symbal: String,
    pub volume: u64,
    pub ask_size: u32,
    pub ask_price: f64,
    pub bid_size: u32,
    pub bid_price: f64,
    pub last_price: f64,
    pub shares_matched: u64,
    pub shares_routed: u64,
}

pub async fn market_quote(
    client: &reqwest::Client,
    market: Market,
) -> Result<RequestResult<MarketQuote>, reqwest::Error> {
    let url = format!(
        "https://www.cboe.com/us/equities/market_statistics/symbol_data/csv/?mkt={}",
        market.to_string()
    );
    let response = client.get(&url).send().await?;
    let quote_csv = response.text().await?;
    let mut quote = MarketQuote {
        market,
        items: vec![],
    };
    for line in quote_csv.lines().skip(1) {
        let fields: Vec<&str> = line.split(',').collect();
        let item = MarketQuoteItem {
            symbal: fields[0].to_string(),
            volume: match fields[1].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            ask_size: match fields[2].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            ask_price: match fields[3].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            bid_size: match fields[4].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            bid_price: match fields[5].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            last_price: match fields[6].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            shares_matched: match fields[7].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
            shares_routed: match fields[8].parse() {
                Ok(volume) => volume,
                Err(err) => return Ok(RequestResult::ParseError(err.to_string())),
            },
        };
        quote.items.push(item);
    }
    Ok(RequestResult::Success(quote))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SymbalMarketQuote {
    pub success: bool,
    pub reload: i64,
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
    pub asks: Vec<Vec<f64>>,
    pub bids: Vec<Vec<f64>>,
    pub trades: Vec<Vec<String>>,
    pub timestamp: String,
    pub tick_type: String,
    pub status: String,
}

pub async fn symbal_market_quote(
    client: &reqwest::Client,
    market: Market,
    symbal: &str,
) -> Result<RequestResult<SymbalMarketQuote>, reqwest::Error> {
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
    let quote = response.json::<SymbalMarketQuote>().await?;
    Ok(RequestResult::Success(quote))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_symbal_market_quote() {
        let client = reqwest::Client::new();
        let market = Market::EDGA;
        let symbal = "AAPL";
        let quote = symbal_market_quote(&client, market, symbal).await.unwrap();
        println!("{:#?}", quote);
    }

    #[tokio::test]
    async fn test_market_quote() {
        let client = reqwest::Client::new();
        let market = Market::EDGA;
        let quote = market_quote(&client, market).await.unwrap();
        match quote {
            RequestResult::Success(quote) => {
                println!("{:#?}", quote.items[0]);
            }
            _ => {}
        }
    }
}
