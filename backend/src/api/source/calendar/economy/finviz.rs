use crate::{Api, AppState, Error};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

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

#[derive(Default, Deserialize)]
pub struct EconomyFinvizCalendar {
    begin: String,
    end: String,
}

impl Api for EconomyFinvizCalendar {
    type Output = Vec<Item>;
    type Error = Error;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, Self::Error> {
        let url = format!(
            "https://finviz.com/api/calendar/economic?dateFrom={}&dateTo={}",
            self.begin, self.end
        );
        let response = state.http_client().get(url).send().await?;
        let items: Vec<Item> = response.json().await?;
        Ok(items)
    }
}
