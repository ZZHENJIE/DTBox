use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub exp: usize,
    pub iat: usize,
    pub iss: String,
    pub sub: i64,
}

impl Claims {
    pub fn new(user_id: i64) -> Self {
        let now = chrono::Utc::now().timestamp() as usize;
        Claims {
            exp: now + 600,
            iat: now,
            iss: "DTBox".into(),
            sub: user_id,
        }
    }
    pub fn encode(user_id: i64, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
        let claims = Self::new(user_id);
        jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(secret),
        )
    }
    pub fn decode(token: &str, secret: &[u8]) -> Result<Self, jsonwebtoken::errors::Error> {
        let token_data = jsonwebtoken::decode::<Claims>(
            token,
            &jsonwebtoken::DecodingKey::from_secret(secret),
            &jsonwebtoken::Validation::default(),
        )?;
        Ok(token_data.claims)
    }
}
