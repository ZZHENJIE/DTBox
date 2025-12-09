use crate::utils::tool;
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

#[derive(Default, Serialize, Deserialize)]
pub struct SpacResearchCalendar {}

impl crate::data_source::Source for SpacResearchCalendar {
    type Output = Vec<Item>;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let response = client
            .get("https://www.spacresearch.com/calendar")
            .send()
            .await?;
        let html_text = response.text().await?;

        let doc = Html::parse_fragment(&html_text);
        let day_li_sel = tool::parse_sel("li.day")?;
        let date_sel = tool::parse_sel(".date")?;
        let event_sel = tool::parse_sel(".event")?;
        let link_sel = tool::parse_sel("a")?;

        let today = Local::now();
        let mut items = Vec::new();

        for day in doc.select(&day_li_sel) {
            let Some(date_node) = day.select(&date_sel).next() else {
                continue;
            };
            let Ok(day_of_month) = date_node.text().collect::<String>().trim().parse::<u32>()
            else {
                continue;
            };

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

                items.push(Item {
                    date: format!("{}-{:02}-{:02}", today.year(), today.month(), day_of_month),
                    event: event_type.into(),
                    symbol: symbol.to_string(),
                });
            }
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
        let spac_research_calendar = SpacResearchCalendar::default();
        let items = spac_research_calendar.fetch(&client).await;
        println!("{:#?}", items);
    }
}
