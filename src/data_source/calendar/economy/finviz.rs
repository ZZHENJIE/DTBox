use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Item {
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

#[derive(Default, Serialize, Deserialize)]
pub struct EconomyFinvizCalendar {
    begin: String,
    end: String,
}

impl crate::data_source::Source for EconomyFinvizCalendar {
    type Output = Vec<Item>;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let url = format!(
            "https://finviz.com/api/calendar/economic?dateFrom={}&dateTo={}",
            self.begin, self.end
        );
        let response = client.get(url).send().await?;
        let items: Vec<Item> = response.json().await?;
        Ok(items)
    }
}

#[cfg(test)]
mod tests {
    use crate::data_source::{Source, calendar::economy::finviz::EconomyFinvizCalendar};

    #[tokio::test]
    async fn test_result() {
        let client = reqwest::Client::new();
        let economy_finviz_calendar = EconomyFinvizCalendar {
            begin: "2025-12-08".to_string(),
            end: "2025-12-12".to_string(),
        };
        let result = economy_finviz_calendar.fetch(&client).await;
        println!("{:#?}", result);
    }
}
