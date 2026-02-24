use std::sync::Arc;

use once_cell::sync::Lazy;
use serde::Deserialize;
use tracing::{info, warn};

#[derive(Deserialize, Debug, Clone)]
pub struct Server {
    pub host: String,
    pub port: u16,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Database {
    pub path: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Web {
    pub path: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Finviz {
    pub api_key: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Jwt {
    pub secret: String,
    pub expires_minutes: i64,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Settings {
    pub server: Server,
    pub database: Database,
    pub web: Web,
    pub finviz: Finviz,
    pub jwt: Jwt,
}

pub static SETTINGS: Lazy<Arc<Settings>> = Lazy::new(|| {
    let settings = Settings::new("./settings.json").unwrap_or_else(|err| {
        panic!("Failed to load settings: {}", err);
    });
    info!("Settings Load Success.");
    Arc::new(settings)
});

impl Settings {
    pub fn new(path: &str) -> anyhow::Result<Self> {
        match std::fs::read(path) {
            Ok(bytes) => {
                let settings: Self = serde_json::from_slice(&bytes)?;
                Ok(settings)
            }
            Err(err) => {
                if err.kind() == std::io::ErrorKind::NotFound {
                    warn!(
                        "Failed to find settings file,load default,please create {} file.",
                        path
                    );
                    return Self::default();
                }
                Err(err.into())
            }
        }
    }
    pub fn default() -> anyhow::Result<Self> {
        let bytes = std::fs::read("./default.json")?;
        let settings: Self = serde_json::from_slice(&bytes)?;
        Ok(settings)
    }
}
