use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Server {
    pub host: String,
    pub port: u16,
    pub background_tasks_refresh: u64,
    pub static_dir: String,
    pub jwt_secret: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Finviz {
    pub auto_token: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Source {
    pub host: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Proxy {
    pub http: Option<String>,
    pub https: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Postgres {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Settings {
    pub server: Server,
    pub postgres: Postgres,
    pub finviz: Finviz,
    pub source: Source,
    pub proxy: Proxy,
}

impl Settings {
    pub fn new(path: &str) -> anyhow::Result<Self, anyhow::Error> {
        match std::fs::read(path) {
            Ok(bytes) => {
                let settings: Self = toml::from_slice(&bytes)?;
                Ok(settings)
            }
            Err(err) => {
                if err.kind() == std::io::ErrorKind::NotFound {
                    return Self::default();
                }
                Err(err.into())
            }
        }
    }
    pub fn default() -> anyhow::Result<Self, anyhow::Error> {
        let bytes = std::fs::read("./default.toml")?;
        let settings: Self = toml::from_slice(&bytes)?;
        Ok(settings)
    }
    pub fn save(&self, path: &str) -> anyhow::Result<(), anyhow::Error> {
        let string = toml::to_string(&self)?;
        let _ = std::fs::write(path, string)?;
        Ok(())
    }
}
