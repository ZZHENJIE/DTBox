use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Application configuration
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AppConfig {
    /// Server configuration
    pub server: ServerConfig,
    /// Database configuration
    pub database: DatabaseConfig,
    /// JWT configuration
    pub jwt: JwtConfig,
    /// Static files configuration
    pub web: WebConfig,
    /// Finviz API configuration
    pub finviz: FinvizConfig,
    /// Logging configuration
    pub log: LogConfig,
    /// Rate limit configuration
    pub rate_limit: RateLimitConfig,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct JwtConfig {
    pub secret: String,
    pub access_token_expires_minutes: i64,
    pub refresh_token_expires_days: i64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct WebConfig {
    pub path: PathBuf,
    /// CORS allowed origin (use default if empty)
    pub cors_origin: Option<String>,
    /// Enable Secure Cookie (should be true in production)
    pub secure_cookie: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FinvizConfig {
    pub api_key: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LogConfig {
    pub level: String,
    pub directory: PathBuf,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RateLimitConfig {
    pub requests_per_second: u32,
    pub burst_size: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                host: "0.0.0.0".to_string(),
                port: 3000,
            },
            database: DatabaseConfig {
                url: "sqlite://./dtbox.db".to_string(),
                max_connections: 10,
            },
            jwt: JwtConfig {
                secret: "your-secret-key-change-in-production".to_string(),
                access_token_expires_minutes: 30,
                refresh_token_expires_days: 7,
            },
            web: WebConfig {
                path: PathBuf::from("./frontend/dist"),
                cors_origin: None,
                secure_cookie: false,
            },
            finviz: FinvizConfig {
                api_key: String::new(),
            },
            log: LogConfig {
                level: "info".to_string(),
                directory: PathBuf::from("./logs"),
            },
            rate_limit: RateLimitConfig {
                requests_per_second: 10,
                burst_size: 20,
            },
        }
    }
}

impl AppConfig {
    /// Load configuration from file
    pub fn load() -> anyhow::Result<Self> {
        let config = config::Config::builder()
            .add_source(config::File::with_name("config").required(false))
            .add_source(config::Environment::with_prefix("DTBOX"))
            .set_default("server.host", "0.0.0.0")?
            .set_default("server.port", 3000)?
            .set_default("database.url", "sqlite://./dtbox.db")?
            .set_default("database.max_connections", 10)?
            .set_default("jwt.access_token_expires_minutes", 30)?
            .set_default("jwt.refresh_token_expires_days", 7)?
            .set_default("log.level", "info")?
            .set_default("log.directory", "./logs")?
            .set_default("rate_limit.requests_per_second", 10)?
            .set_default("rate_limit.burst_size", 20)?
            .set_default("web.cors_origin", "")?
            .set_default("web.secure_cookie", false)?
            .build()?;

        Ok(config.try_deserialize()?)
    }
}
