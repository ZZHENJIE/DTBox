use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub exp: usize,
    pub iat: usize,
    pub iss: String,
    pub sub: i32,
    pub jti: String,
}

impl Claims {
    pub fn new(user_id: i32) -> Self {
        let now = chrono::Utc::now().timestamp() as usize;
        let uuid = uuid::Uuid::new_v4().to_string();
        Claims {
            exp: now + 600,
            iat: now,
            iss: "DTBox".into(),
            sub: user_id,
            jti: uuid,
        }
    }
    pub fn encode(
        user_id: i32,
        secret: &[u8],
    ) -> Result<(String, String), jsonwebtoken::errors::Error> {
        let claims = Self::new(user_id);
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(secret),
        )?;
        Ok((token, claims.jti))
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
