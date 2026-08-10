use std::sync::Arc;

use benzinga_sdk::calendar::{self, EconomicsQuery};
use chrono::Local;
use serde::Serialize;

use crate::api;
use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
pub struct EconomicsItem {
    pub event_name: String,
    pub date: String,
    pub time: String,
    pub country: String,
    pub importance: u8,
}

pub async fn fetch_usa_economics(state: &Arc<AppState>) -> Result<Vec<EconomicsItem>, String> {
    let today = Local::now().date_naive();

    let query = EconomicsQuery {
        page_size: 100,
        date_from: today,
        date_to: today,
    };

    let items: Vec<calendar::economics::Item> =
        api::post_with_auth(state, "/api/benzinga/calendar/economics", &query).await?;

    let result: Vec<EconomicsItem> = items
        .into_iter()
        .filter(|item| item.country == "USA")
        .map(|item| EconomicsItem {
            event_name: item.event_name,
            date: item.date,
            time: item.time,
            country: item.country,
            importance: item.importance,
        })
        .collect();

    Ok(result)
}
