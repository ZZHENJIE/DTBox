use crate::Result;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct Finviz {
    http_client: reqwest::Client,
    api_key: String,
}

impl Finviz {
    pub fn new(http_client: reqwest::Client, api_key: String) -> Self {
        Self {
            http_client,
            api_key,
        }
    }

    pub async fn screener(&self, parameter: ScreenerParameter) -> Result<Vec<ScreenerItem>> {
        let url = format!(
            "https://elite.finviz.com/export.ashx?v=111&f={}&auth={}",
            parameter.query, self.api_key
        );
        let response = self.http_client.get(&url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<ScreenerItem> = Vec::new();
        for result in rdr.deserialize() {
            let record: ScreenerItem = result?;
            items.push(record);
        }
        Ok(items)
    }

    pub async fn quote(&self, parameter: QuoteParameter) -> Result<QuoteResult> {
        let date_from = parameter.date_from.unwrap_or_else(|| {
            let now = SystemTime::now();
            let duration = now
                .duration_since(UNIX_EPOCH)
                .expect("clock went backwards");
            duration.as_secs()
        });
        let interval = parameter.interval.unwrap_or(Interval::Minutes);
        let url = format!(
            "https://api.finviz.com/api/quote.ashx?dateFrom={}&instrument=stock&ticker={}&timeframe={}",
            date_from,
            parameter.symbol,
            String::from(&interval)
        );
        let response = self.http_client.get(url).send().await?;
        let quote: QuoteResult = response.json().await?;
        Ok(quote)
    }

    pub async fn event(&self, parameter: EventParameter) -> Result<EventResult> {
        let url: String = format!("{}&auth={}", String::from(&parameter), self.api_key);
        let response = self.http_client.get(url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        match parameter {
            EventParameter::News | EventParameter::Blogs => {
                let mut items = Vec::new();
                for result in rdr.deserialize() {
                    let record: EventItemWithCommon = result?;
                    items.push(record);
                }
                Ok(EventResult::Common(items))
            }
            EventParameter::Stock(_) | EventParameter::ETF(_) => {
                let mut items = Vec::new();
                for result in rdr.deserialize() {
                    let record: EventItemWithSymbol = result?;
                    items.push(record);
                }
                Ok(EventResult::Symbol(items))
            }
        }
    }

    pub async fn candlestick(
        &self,
        parameter: CandlestickParameter,
    ) -> Result<Vec<CandlestickItem>> {
        let url = format!(
            "https://elite.finviz.com/quote_export.ashx?t={}&p={}&r={}&auth={}",
            parameter.symbol,
            String::from(&parameter.interval),
            parameter.space,
            self.api_key
        );
        let response = self.http_client.get(url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<CandlestickItem> = Vec::new();
        for result in rdr.deserialize() {
            let record: CandlestickItem = result?;
            items.push(record);
        }
        Ok(items)
    }

    pub async fn calendar_economy(
        &self,
        parameter: CalendarEconomyParameter,
    ) -> Result<Vec<CalendarEconomyItem>> {
        let url = format!(
            "https://finviz.com/api/calendar/economic?dateFrom={}&dateTo={}",
            parameter.begin, parameter.end
        );
        let response = self.http_client.get(url).send().await?;
        let items: Vec<CalendarEconomyItem> = response.json().await?;
        Ok(items)
    }
}

#[derive(Deserialize)]
pub struct CalendarEconomyParameter {
    pub begin: String,
    pub end: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CalendarEconomyItem {
    pub calendar_id: i64,
    pub ticker: String,
    pub event: String,
    pub category: String,
    pub date: String,
    pub reference: Option<String>,
    pub reference_date: Option<String>,
    pub actual: Option<String>,
    pub previous: Option<String>,
    pub forecast: Option<String>,
    pub teforecast: Option<String>,
    pub importance: i8,
    pub is_higher_positive: i8,
    pub has_no_detail: bool,
    pub alert: Option<serde_json::Value>,
    pub all_day: bool,
    pub non_emptiness_score: i8,
}

#[derive(Deserialize)]
pub enum Interval {
    Minutes,
    Minutes2,
    Minutes3,
    Minutes5,
    Minutes10,
    Minutes15,
    Minutes30,
    Hour,
    Hour2,
    Hour4,
    Day,
    Week,
    Month,
}

impl From<&Interval> for String {
    fn from(value: &Interval) -> Self {
        match value {
            Interval::Minutes => "i1".to_string(),
            Interval::Minutes2 => "i2".to_string(),
            Interval::Minutes3 => "i3".to_string(),
            Interval::Minutes5 => "i5".to_string(),
            Interval::Minutes10 => "i10".to_string(),
            Interval::Minutes15 => "i15".to_string(),
            Interval::Minutes30 => "i30".to_string(),
            Interval::Hour => "h".to_string(),
            Interval::Hour2 => "h2".to_string(),
            Interval::Hour4 => "h4".to_string(),
            Interval::Day => "d".to_string(),
            Interval::Week => "w".to_string(),
            Interval::Month => "m".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CandlestickItem {
    #[serde(rename = "Date")]
    pub date: String,
    #[serde(rename = "Open")]
    pub open: f32,
    #[serde(rename = "High")]
    pub high: f32,
    #[serde(rename = "Low")]
    pub low: f32,
    #[serde(rename = "Close")]
    pub close: f32,
    #[serde(rename = "Volume")]
    pub volume: u64,
}

#[derive(Deserialize)]
pub struct CandlestickParameter {
    pub symbol: String,
    pub interval: Interval,
    pub space: String, // d1 | d5 | m1 | m3 | m6 | ytd | y1 | y2 | y5 | max
}

#[derive(Serialize, Deserialize)]
pub struct EventItemWithCommon {
    #[serde(rename = "Title")]
    pub title: String,
    #[serde(rename = "Source")]
    pub source: String,
    #[serde(rename = "Date")]
    pub date: String,
    #[serde(rename = "Url")]
    pub url: String,
    #[serde(rename = "Category")]
    pub category: String,
}

#[derive(Serialize, Deserialize)]
pub struct EventItemWithSymbol {
    #[serde(rename = "Title")]
    pub title: String,
    #[serde(rename = "Source")]
    pub source: String,
    #[serde(rename = "Date")]
    pub date: String,
    #[serde(rename = "Url")]
    pub url: String,
    #[serde(rename = "Category")]
    pub category: String,
    #[serde(rename = "Ticker")]
    pub symbol: String,
}

#[derive(Serialize, Deserialize)]
pub enum EventResult {
    Common(Vec<EventItemWithCommon>),
    Symbol(Vec<EventItemWithSymbol>),
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "symbol")]
pub enum EventParameter {
    News,
    Blogs,
    Stock(String),
    ETF(String),
}

impl From<&EventParameter> for String {
    fn from(value: &EventParameter) -> Self {
        let root = "https://elite.finviz.com/news_export.ashx";
        match value {
            EventParameter::News => format!("{}?c=1", root),
            EventParameter::Blogs => format!("{}?c=2", root),
            EventParameter::Stock(symbol) => format!("{}?v=3&t={}", root, symbol),
            EventParameter::ETF(symbol) => format!("{}?v=4&t={}", root, symbol),
        }
    }
}

#[derive(Deserialize)]
pub struct QuoteParameter {
    pub symbol: String,
    pub date_from: Option<u64>,
    pub interval: Option<Interval>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteResult {
    #[serde(rename = "ticker")]
    pub symbol: String,
    pub timeframe: String,
    pub volume: Vec<i64>,
    pub date: Vec<i64>,
    pub open: Vec<f32>,
    pub high: Vec<f32>,
    pub low: Vec<f32>,
    pub close: Vec<f32>,
    pub last_open: f64,
    pub last_high: f64,
    pub last_low: f64,
    pub last_close: f64,
    pub last_volume: i64,
    pub data_id: String,
    pub last_date: i64,
    pub last_time: i64,
    pub prev_close: f64,
    pub after_close: Option<f64>,
    pub after_change: Option<f64>,
    pub after_time: Option<i64>,
    pub update_ohlc_version: i64,
    pub chart_events: Vec<Option<serde_json::Value>>,
}

#[derive(Deserialize)]
pub struct ScreenerParameter {
    pub query: String,
}

#[derive(Serialize, Deserialize)]
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
