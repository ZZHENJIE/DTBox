use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub enum Query {
    News,
    Blogs,
    Stock(String),
    ETF(String),
}

impl Default for Query {
    fn default() -> Self {
        Query::News
    }
}

impl From<Query> for String {
    fn from(value: Query) -> Self {
        let root = "https://elite.finviz.com/news_export.ashx";
        match value {
            Query::News => format!("{}?c=1", root),
            Query::Blogs => format!("{}?c=2", root),
            Query::Stock(symbol) => format!("{}?v=3&t={}", root, symbol),
            Query::ETF(symbol) => format!("{}?v=4&t={}", root, symbol),
        }
    }
}

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

#[derive(Default, Serialize, Deserialize)]
pub struct EventFinviz {
    pub auth: String,
    pub query: Query,
}

impl crate::data_source::Source for EventFinviz {
    type Output = ItemsRecord;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let url: String = format!("{}&auth={}", String::from(self.query.clone()), self.auth);
        let response = client.get(url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        match self.query {
            Query::News | Query::Blogs => {
                let mut items = Vec::new();
                for result in rdr.deserialize() {
                    let record: Item = result?;
                    items.push(record);
                }
                Ok(ItemsRecord::Common(items))
            }
            Query::Stock(_) | Query::ETF(_) => {
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data_source::Source;

    #[tokio::test]
    async fn test_result() {
        let client = reqwest::Client::new();
        let symbol = String::from("EB");
        let event_finviz = EventFinviz {
            query: Query::Stock(symbol.clone()),
            auth: "6d4a3d20-4cff-4466-81fb-49740b20ec1c".to_string(),
        };
        let result = event_finviz.fetch(&client).await;
        println!("{:#?}", result);
    }
}
