use rand::RngCore;

pub struct Token;

impl Token {
    pub fn new() -> String {
        let mut buf = [0u8; 32];
        rand::rng().fill_bytes(&mut buf);
        base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, &buf)
    }
}
