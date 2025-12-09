use crate::utils::tool;
use scraper::Html;
use serde::{Deserialize, Serialize};

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

#[derive(Default, Serialize, Deserialize)]
pub struct IposcoopCalendar {}

impl crate::data_source::Source for IposcoopCalendar {
    type Output = Vec<Item>;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let response = client
            .get("https://www.iposcoop.com/ipo-calendar/")
            .send()
            .await?;
        let html_text = response.text().await?;

        let fragment = Html::parse_fragment(&html_text);
        let tr_sel = tool::parse_sel("tr")?;
        let td_sel = tool::parse_sel("td")?;

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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data_source::Source;

    #[tokio::test]
    async fn test_result() {
        let client = reqwest::Client::new();
        let iposcoop_calendar = IposcoopCalendar::default();
        let result = iposcoop_calendar.fetch(&client).await;
        println!("{:#?}", result);
    }
}
