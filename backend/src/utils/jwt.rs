use crate::utils::SETTINGS;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Claims {
    jti: String,         // JWT ID
    sub: i64,            // 用户ID
    iat: i64,            // 签发时间
    exp: i64,            // 过期时间
    iss: Option<String>, // 签发者
    aud: Option<String>, // 接收者
}

static JWT_EXPIRES_SECONDS: Lazy<i64> = Lazy::new(|| SETTINGS.jwt.expires_minutes * 60);

impl Claims {
    pub fn new(user_id: i64) -> Self {
        let now = chrono::Utc::now().timestamp();
        let expires = now + *JWT_EXPIRES_SECONDS;
        let uuid = uuid::Uuid::new_v4().to_string();
        Claims {
            exp: expires,
            iat: now,
            iss: Some("dtbox.com".into()),
            aud: Some("dtbox.com".into()),
            sub: user_id,
            jti: uuid,
        }
    }
    pub fn sub_data(&self) -> i64 {
        self.sub
    }
    pub fn encode(&self) -> anyhow::Result<String> {
        let secret = SETTINGS.jwt.secret.as_bytes();
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            self,
            &jsonwebtoken::EncodingKey::from_secret(secret),
        )?;
        Ok(token)
    }
    pub fn decode(token: &[u8]) -> anyhow::Result<Self> {
        let secret = SETTINGS.jwt.secret.as_bytes();
        let mut validation = jsonwebtoken::Validation::default();
        validation.set_audience(&["dtbox.com"]);
        let data = jsonwebtoken::decode::<Claims>(
            token,
            &jsonwebtoken::DecodingKey::from_secret(secret),
            &validation,
        )?;
        Ok(data.claims)
    }
}
