use crate::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
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

#[derive(Debug, Serialize, Deserialize)]
pub struct ItemWithSymbol {
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

#[derive(Debug, Serialize, Deserialize)]
pub enum ItemsRecord {
    Common(Vec<Item>),
    Symbol(Vec<ItemWithSymbol>),
}

#[derive(Serialize, Deserialize)]
pub enum EventFinviz {
    News,
    Blogs,
    Stock(String),
    ETF(String),
}

impl From<&EventFinviz> for String {
    fn from(value: &EventFinviz) -> Self {
        let root = "https://elite.finviz.com/news_export.ashx";
        match value {
            EventFinviz::News => format!("{}?c=1", root),
            EventFinviz::Blogs => format!("{}?c=2", root),
            EventFinviz::Stock(symbol) => format!("{}?v=3&t={}", root, symbol),
            EventFinviz::ETF(symbol) => format!("{}?v=4&t={}", root, symbol),
        }
    }
}

impl crate::data_source::Source for EventFinviz {
    type Output = ItemsRecord;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, anyhow::Error> {
        let url: String = format!(
            "{}&auth={}",
            String::from(self),
            state.settings().finviz.auto_token
        );
        let response = state.http_client().get(url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        match self {
            EventFinviz::News | EventFinviz::Blogs => {
                let mut items = Vec::new();
                for result in rdr.deserialize() {
                    let record: Item = result?;
                    items.push(record);
                }
                Ok(ItemsRecord::Common(items))
            }
            EventFinviz::Stock(_) | EventFinviz::ETF(_) => {
                let mut items = Vec::new();
                for result in rdr.deserialize() {
                    let record: ItemWithSymbol = result?;
                    items.push(record);
                }
                Ok(ItemsRecord::Symbol(items))
            }
        }
    }
}
