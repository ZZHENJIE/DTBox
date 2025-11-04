#[derive(Copy, Clone)]
pub enum Language {
    EN,
    ZHCN,
    ZHTW,
}

impl Language {
    pub fn google(&self) -> &'static str {
        match self {
            Language::EN => "en",
            Language::ZHCN => "zh-CN",
            Language::ZHTW => "zh-TW",
        }
    }
}
