use chrono::{Datelike, Local};
use scraper::Html;
use serde::{Deserialize, Serialize};

use crate::Result;

#[derive(Debug, Clone)]
pub struct Integrations {
    http_client: reqwest::Client,
}

impl Integrations {
    pub fn new(http_client: reqwest::Client) -> Self {
        Self { http_client }
    }

    pub async fn ipo_scoop(&self) -> Result<Vec<IPOScoopItem>> {
        let response = self
            .http_client
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
            let item = IPOScoopItem {
                company: normalize_ws(&text(0)),
                symbol: text(1),
                managers: normalize_ws(&text(2)),
                shares_millions: text(3),
                price_low: text(4),
                price_high: text(5),
                expected_date: text(7),
            };
            items.push(item);
        }

        Ok(items)
    }

    pub async fn spac_research(&self) -> Result<Vec<SPACResearchItem>> {
        let response = self
            .http_client
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
        let mut current_month_items: Vec<SPACResearchItem> = Vec::new();
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
                    current_month_items.push(SPACResearchItem {
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

fn normalize_ws(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[derive(Serialize, Deserialize)]
pub enum SPACResearchEvent {
    AmendmentVote,
    ApprovalVote,
    IpoDate,
    LiqDeadline,
    Other,
}

impl From<&str> for SPACResearchEvent {
    fn from(value: &str) -> Self {
        match value {
            "ipo-date" => SPACResearchEvent::IpoDate,
            "approval-vote" => SPACResearchEvent::ApprovalVote,
            "amendment-vote" => SPACResearchEvent::AmendmentVote,
            "liq-deadline" => SPACResearchEvent::LiqDeadline,
            _ => SPACResearchEvent::Other,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct SPACResearchItem {
    pub date: String,
    pub event: SPACResearchEvent,
    pub symbol: String,
}

#[derive(Serialize, Deserialize)]
pub struct IPOScoopItem {
    pub company: String,
    pub symbol: String,
    pub managers: String,
    pub shares_millions: String,
    pub price_high: String,
    pub price_low: String,
    pub expected_date: String,
}
