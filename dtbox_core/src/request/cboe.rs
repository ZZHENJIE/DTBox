use log::error;
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
) -> Result<MarketQuote, reqwest::Error> {
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
            volume: fields[1].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse volume: {}", err);
                0
            }),
            ask_size: fields[2].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse ask_size: {}", err);
                0
            }),
            ask_price: fields[3].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse ask_price: {}", err);
                0.0
            }),
            bid_size: fields[4].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse bid_size: {}", err);
                0
            }),
            bid_price: fields[5].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse bid_price: {}", err);
                0.0
            }),
            last_price: fields[6].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse last_price: {}", err);
                0.0
            }),
            shares_matched: fields[7].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse shares_matched: {}", err);
                0
            }),
            shares_routed: fields[8].parse().unwrap_or_else(|err| {
                error!("Cboe Market Quote Failed to parse shares_routed: {}", err);
                0
            }),
        };
        quote.items.push(item);
    }
    Ok(quote)
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
) -> Result<SymbalMarketQuote, reqwest::Error> {
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
    Ok(quote)
}
