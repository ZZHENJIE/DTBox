use crate::api::API;
use chrono::{Datelike, Local};
use scraper::Html;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum Event {
    AmendmentVote,
    ApprovalVote,
    IpoDate,
    LiqDeadline,
    Other,
}

impl From<&str> for Event {
    fn from(value: &str) -> Self {
        match value {
            "ipo-date" => Event::IpoDate,
            "approval-vote" => Event::ApprovalVote,
            "amendment-vote" => Event::AmendmentVote,
            "liq-deadline" => Event::LiqDeadline,
            _ => Event::Other,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    pub date: String,
    pub event: Event,
    pub symbol: String,
}

#[derive(Default, Deserialize)]
pub struct SpacResearchCalendar {}

impl API for SpacResearchCalendar {
    type Output = Vec<Item>;

    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        let response = state
            .http_client()
            .get("https://www.spacresearch.com/calendar")
            .send()
            .await?;
        let html_text = response.text().await?;

        let doc = Html::parse_fragment(&html_text);
        let day_li_sel = scraper::Selector::parse("li.day")?;
        let date_sel = scraper::Selector::parse(".date")?;
        let event_sel = scraper::Selector::parse(".event")?;
        let link_sel = scraper::Selector::parse("a")?;

        let today = Local::now();
        let mut prev_day: u32 = 0;
        let mut in_current_month = false;
        let mut current_month_items: Vec<Item> = Vec::new();
        let mut next_month_started = false;

        for day in doc.select(&day_li_sel) {
            let Some(date_node) = day.select(&date_sel).next() else {
                continue;
            };
            let Ok(day_of_month) = date_node.text().collect::<String>().trim().parse::<u32>()
            else {
                continue;
            };

            if !in_current_month {
                if day_of_month == 1 || (prev_day > 20 && day_of_month < 10) {
                    in_current_month = true;
                } else if prev_day != 0 && day_of_month < prev_day && day_of_month > 20 {
                    prev_day = day_of_month;
                    continue;
                }
            } else {
                if prev_day > 20 && day_of_month < 10 {
                    next_month_started = true;
                }
            }

            if next_month_started {
                break;
            }

            for event in day.select(&event_sel) {
                let event_type = event
                    .value()
                    .classes()
                    .find(|&c| c != "event")
                    .unwrap_or_default();

                let symbol = event
                    .select(&link_sel)
                    .next()
                    .and_then(|a| a.value().attr("href"))
                    .and_then(|href| href.split('/').filter(|s| !s.is_empty()).last())
                    .unwrap_or_default();

                if in_current_month {
                    current_month_items.push(Item {
                        date: format!("{}-{:02}-{:02}", today.year(), today.month(), day_of_month),
                        event: event_type.into(),
                        symbol: symbol.to_string(),
                    });
                }
            }
            prev_day = day_of_month;
        }
        Ok(current_month_items)
    }
}
