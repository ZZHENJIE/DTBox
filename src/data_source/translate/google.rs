use serde::{Deserialize, Serialize};

use crate::utils::translate::{Language, Translate};

#[derive(Default, Serialize, Deserialize)]
pub struct GoogleTranslate {
    pub text: String,
    pub translate: Translate,
}

fn format(language: Language) -> &'static str {
    match language {
        Language::EN => "en",
        Language::ZHCN => "zh-CN",
        Language::ZHTW => "zh-TW",
    }
}

impl crate::data_source::Source for GoogleTranslate {
    type Output = String;

    async fn fetch(&self, client: &reqwest::Client) -> Result<Self::Output, anyhow::Error> {
        let url = format!(
            "https://translate.google.com/translate_a/single?client=gtx&sl={}&tl={}&dt=t&q={}",
            format(self.translate.from()),
            format(self.translate.to()),
            self.text
        );
        let response = client.get(url).send().await?;
        let response_json = response.json::<serde_json::Value>().await?;
        let result = response_json[0][0][0].as_str().unwrap_or_else(|| "");
        Ok(result.to_string())
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        data_source::{Source, translate::google::GoogleTranslate},
        utils::translate::{Language, Translate},
    };

    #[tokio::test]
    async fn test_google_translate() {
        let client = reqwest::Client::new();
        let translate = Translate::new(Language::EN, Language::ZHCN);
        let google_translate = GoogleTranslate {
            text: "GPUI is a hybrid immediate and retained mode, GPU accelerated, UI framework for Rust, designed to support a wide variety of applications.".to_string(),
            translate,
        };
        let result = google_translate.fetch(&client).await;
        println!("{:#?}", result);
    }
}
