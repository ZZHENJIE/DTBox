use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{
    Api, AppState, Error,
    utils::translate::{Language, Translate},
};

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

impl Api for GoogleTranslate {
    type Output = String;
    type Error = Error;

    async fn fetch(&self, state: Arc<AppState>) -> Result<Self::Output, Self::Error> {
        let url = format!(
            "https://translate.google.com/translate_a/single?client=gtx&sl={}&tl={}&dt=t&q={}",
            format(self.translate.from()),
            format(self.translate.to()),
            self.text
        );
        let response = state.http_client().get(url).send().await?;
        let response_json = response.json::<serde_json::Value>().await?;
        let result = response_json[0][0][0].as_str().unwrap_or_default();
        Ok(result.to_string())
    }
}
