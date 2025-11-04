use crate::utils::language;
use crate::RequestResult;

pub struct Translate {
    from_language: language::Language,
    to_language: language::Language,
}

impl Default for Translate {
    fn default() -> Self {
        Translate {
            from_language: language::Language::EN,
            to_language: language::Language::ZHCN,
        }
    }
}

impl Translate {
    pub fn new(from_language: language::Language, to_language: language::Language) -> Self {
        Translate {
            from_language,
            to_language,
        }
    }
    pub fn set_from_language(&mut self, language: language::Language) {
        self.from_language = language;
    }
    pub fn set_to_language(&mut self, language: language::Language) {
        self.to_language = language;
    }
    pub fn from_language(&self) -> language::Language {
        self.from_language
    }
    pub fn to_language(&self) -> language::Language {
        self.to_language
    }
    pub async fn google(
        &self,
        client: &reqwest::Client,
        text: String,
    ) -> Result<RequestResult<String>, reqwest::Error> {
        let url = format!(
            "https://translate.google.com/translate_a/single?client=gtx&sl={}&tl={}&dt=t&q={}",
            self.from_language.google(),
            self.to_language.google(),
            text
        );
        let response = client.get(url).send().await?;
        let response_json = response.json::<serde_json::Value>().await?;
        let result = match response_json[0][0][0].as_str() {
            Some(result) => result,
            None => return Ok(RequestResult::JsonError("No result found".to_string())),
        };
        Ok(RequestResult::Success(result.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_google_translate() {
        let translate = Translate::new(language::Language::EN, language::Language::ZHCN);
        let result = translate
            .google(&reqwest::Client::new(), "GPUI is a hybrid immediate and retained mode, GPU accelerated, UI framework for Rust, designed to support a wide variety of applications.".to_string())
            .await;
        println!("{:#?}", result);
    }
}
