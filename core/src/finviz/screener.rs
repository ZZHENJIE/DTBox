use crate::RequestResult;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
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
    pub market_cap: f64,
    #[serde(rename = "P/E")]
    pub p_e: Option<f32>,
    #[serde(rename = "Price")]
    pub price: f32,
    #[serde(rename = "Change")]
    pub change: String,
    #[serde(rename = "Volume")]
    pub volume: u64,
}

pub async fn screener(
    client: &reqwest::Client,
    parameters: &str,
    authorization: &str,
) -> Result<RequestResult<Vec<ScreenerItem>>, reqwest::Error> {
    let url = format!(
        "https://elite.finviz.com/export.ashx?v=111&f={}&auth={}",
        parameters, authorization
    );
    let response = client.get(&url).send().await?;
    let screener_csv = response.text().await?;
    let mut rdr = csv::Reader::from_reader(screener_csv.as_bytes());
    let mut screener: Vec<ScreenerItem> = vec![];
    for result in rdr.deserialize() {
        let record: ScreenerItem = match result {
            Ok(result) => result,
            Err(err) => return Ok(RequestResult::Error(err.to_string())),
        };
        screener.push(record);
    }
    Ok(RequestResult::Success(screener))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn test_screener() {
        let client = reqwest::Client::new();
        let parameters = "";
        let authorization = "6d4a3d20-4cff-4466-81fb-49740b20ec1c";
        let screener = screener(&client, parameters, authorization).await.unwrap();
        match screener {
            RequestResult::Success(screener) => {
                println!("{:#?}", screener[0]);
            }
            RequestResult::Error(err) => {
                println!("{:#?}", err);
            }
        }
    }
}
