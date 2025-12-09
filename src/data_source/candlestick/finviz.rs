use serde::{Deserialize, Serialize};

#[derive(Default, Serialize, Deserialize)]
pub struct Query {
    pub symbol: String,
    pub interval: String,
    pub space: String,
}

impl Query {
    pub fn url(&self, auth: &str) -> String {
        format!(
            "https://elite.finviz.com/quote_export.ashx?t={}&p={}&r={}&auth={}",
            self.symbol, self.interval, self.space, auth
        )
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
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

#[derive(Default, Serialize, Deserialize)]
pub struct CandlestickFinviz {
    pub query: Query,
    pub auth: String,
}

impl crate::data_source::Source for CandlestickFinviz {
    type Output = Vec<Item>;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let url = self.query.url(&self.auth);
        let response = client.get(url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<Item> = Vec::new();
        for result in rdr.deserialize() {
            let record: Item = result?;
            items.push(record);
        }
        Ok(items)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data_source::Source;

    #[tokio::test]
    async fn test_result() {
        let client = reqwest::Client::new();
        let query = Query {
            symbol: "AAPL".to_string(),
            interval: "i1".to_string(),
            space: "d1".to_string(),
        };
        let auth = "6d4a3d20-4cff-4466-81fb-49740b20ec1c".to_string();
        let candlestick_finviz = CandlestickFinviz { query, auth };
        let result = candlestick_finviz.fetch(&client).await;
        println!("{:#?}", result);
    }
}
