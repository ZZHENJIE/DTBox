use crate::{Api, AppState, Error, utils::tool};
use scraper::Html;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    pub company: String,
    pub symbol: String,
    pub managers: String,
    pub shares_millions: String,
    pub price_high: String,
    pub price_low: String,
    pub expected_date: String,
}

#[derive(Default, Deserialize)]
pub struct IposcoopCalendar {}

impl Api for IposcoopCalendar {
    type Output = Vec<Item>;
    type Error = Error;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, Self::Error> {
        let response = state
            .http_client()
            .get("https://www.iposcoop.com/ipo-calendar/")
            .send()
            .await?;
        let html_text = response.text().await?;

        let fragment = Html::parse_fragment(&html_text);
        let tr_sel = scraper::Selector::parse("tr")?;
        let td_sel = scraper::Selector::parse("td")?;

        let mut items = Vec::new();

        for tr in fragment.select(&tr_sel) {
            let tds: Vec<_> = tr.select(&td_sel).collect();
            if tds.len() < 8 {
                continue;
            }
            let text = |i: usize| tds[i].text().collect::<String>().trim().to_owned();
            let item = Item {
                company: tool::normalize_ws(text(0)),
                symbol: text(1),
                managers: tool::normalize_ws(text(2)),
                shares_millions: text(3),
                price_low: text(4),
                price_high: text(5),
                expected_date: text(7),
            };
            items.push(item);
        }

        Ok(items)
    }
}
