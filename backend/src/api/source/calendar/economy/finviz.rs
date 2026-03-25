use crate::api::API;
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

#[derive(Deserialize)]
pub struct EconomyFinvizCalendar {
    begin: String,
    end: String,
}

impl API for EconomyFinvizCalendar {
    type Output = Vec<Item>;

    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        let url = format!(
            "https://finviz.com/api/calendar/economic?dateFrom={}&dateTo={}",
            self.begin, self.end
        );
        let response = state.http_client().get(url).send().await?;
        let items: Vec<Item> = response.json().await?;
        Ok(items)
    }
}
