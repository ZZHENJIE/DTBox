use serde::{Deserialize, Serialize};

#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
pub enum Language {
    EN,
    ZHCN,
    ZHTW,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Translate {
    from: Language,
    to: Language,
}

impl Default for Translate {
    fn default() -> Self {
        Translate {
            from: Language::EN,
            to: Language::ZHCN,
        }
    }
}

impl Translate {
    pub fn new(from: Language, to: Language) -> Self {
        Translate { from, to }
    }
    pub fn set_from(&mut self, language: Language) {
        self.from = language;
    }
    pub fn set_to(&mut self, language: Language) {
        self.to = language;
    }
    pub fn from(&self) -> Language {
        self.from
    }
    pub fn to(&self) -> Language {
        self.to
    }
}
