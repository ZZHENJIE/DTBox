use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct Config {
    pub server: ServerConfig,
    pub database_url: String,
    pub redis_url: String,
    pub jwt: JWTConfig,
    pub logging_level: String,
    pub data_source: DataSourceConfig,
    pub rate_limiter: RateLimiterConfig,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub web_dir: String,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct JWTConfig {
    pub secret: String,
    pub access_token_expire_minutes: u64,
    pub refresh_token_expire_days: u64,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct DataSourceConfig {
    pub finviz_api_key: String,
    pub alpaca: AlpacaConfig,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct AlpacaConfig {
    pub api_key: String,
    pub api_secret: String,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
pub struct RateLimiterConfig {
    pub max_requests: u64,
    pub window_seconds: u64,
}

impl Config {
    pub fn load(path: impl AsRef<std::path::Path>) -> Result<Self, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let settings = toml::from_str(&content)?;
        Ok(settings)
    }
}
