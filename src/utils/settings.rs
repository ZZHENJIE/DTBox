use serde::Deserialize;
use tracing::warn;

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
}

#[derive(Deserialize, Debug, Clone)]
pub struct Settings {
    pub server: Server,
    pub database: Database,
    pub web: Web,
    pub finviz: Finviz,
    pub jwt: Jwt,
}

impl Settings {
    pub async fn new(path: &str) -> anyhow::Result<Self> {
        match tokio::fs::read(path).await {
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
                    return Self::default().await;
                }
                Err(err.into())
            }
        }
    }
    pub async fn default() -> anyhow::Result<Self> {
        let bytes = tokio::fs::read("./default.json").await?;
        let settings: Self = serde_json::from_slice(&bytes)?;
        Ok(settings)
    }
}
