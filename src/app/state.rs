use crate::database::manager::open_database;
use std::sync::Arc;

pub struct AppState {
    settings: crate::Settings,
    database: sqlx::Pool<sqlx::Sqlite>,
    http_client: Arc<reqwest::Client>,
}

impl AppState {
    pub async fn new(settings: crate::Settings) -> anyhow::Result<Self, anyhow::Error> {
        Ok(Self {
            database: open_database(&settings.sqlite.path).await?,
            http_client: Arc::new(reqwest::Client::new()),
            settings,
        })
    }
    pub fn settings(&self) -> &crate::Settings {
        &self.settings
    }
    pub fn http_client(&self) -> &reqwest::Client {
        &self.http_client
    }
    pub fn database_pool(&self) -> &sqlx::Pool<sqlx::Sqlite> {
        &self.database
    }
}
