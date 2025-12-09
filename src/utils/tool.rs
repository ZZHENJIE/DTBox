use rand::RngCore;

pub fn normalize_ws(s: String) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn parse_sel(selector: &str) -> Result<scraper::Selector, anyhow::Error> {
    scraper::Selector::parse(selector).map_err(|e| anyhow::anyhow!(e.to_string()))
}

pub fn new_token() -> String {
    let mut buf = [0u8; 32];
    rand::rng().fill_bytes(&mut buf);
    base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, &buf)
}
