use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Default, Serialize, Deserialize)]
pub struct ScreenerFinviz {
    pub query: String,
    pub auth: String,
}

impl crate::data_source::Source for ScreenerFinviz {
    type Output = Vec<ScreenerItem>;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let url = format!(
            "https://elite.finviz.com/export.ashx?v=111&f={}&auth={}",
            self.query, self.auth
        );
        let response = client.get(&url).send().await?;
        let csv = response.text().await?;
        let mut rdr = csv::Reader::from_reader(csv.as_bytes());
        let mut items: Vec<ScreenerItem> = Vec::new();
        for result in rdr.deserialize() {
            let record: ScreenerItem = result?;
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
    async fn test_screener() {
        let client = reqwest::Client::new();
        let screener_finviz = ScreenerFinviz {
            query: "&o=-volume".to_string(),
            auth: "6d4a3d20-4cff-4466-81fb-49740b20ec1c".to_string(),
        };
        let result = screener_finviz.fetch(&client).await;
        println!("{:#?}", result);
    }
}
