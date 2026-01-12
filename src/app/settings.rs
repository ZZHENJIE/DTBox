use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Server {
    pub host: String,
    pub port: u16,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Finviz {
    pub api_token: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Sqlite {
    pub path: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Jwt {
    pub secret: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Web {
    pub path: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Settings {
    pub server: Server,
    pub sqlite: Sqlite,
    pub finviz: Finviz,
    pub web: Web,
    pub jwt: Jwt,
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
