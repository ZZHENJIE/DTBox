use crate::{config::AppConfig, database::Database, repository::Repositories, service::Services};
use reqwest::Client;
use std::sync::Arc;

/// Application state
#[derive(Debug, Clone)]
pub struct AppState {
    pub services: Services,
    pub config: Arc<AppConfig>,
    pub http_client: Client,
}

impl AppState {
    /// Create application state
    pub async fn new(config: AppConfig) -> anyhow::Result<Self> {
        let config = Arc::new(config);

        // Create database connection
        let db = Database::connect(
            &config.database.url,
            config.database.max_connections,
        )
        .await?;

        // Run migrations
        db.migrate().await?;

        // Create repository layer
        let repos = Repositories::new(&db);

        // Create HTTP client
        let http_client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;

        // Create service layer
        let services = Services::new(repos, config.clone(), http_client.clone());

        Ok(Self {
            services,
            config,
            http_client,
        })
    }

    /// Get services
    pub fn services(&self) -> &Services {
        &self.services
    }

    /// Get config
    pub fn config(&self) -> &AppConfig {
        &self.config
    }
}

// Convenience for using State<AppState> in Axum handlers
impl axum::extract::FromRef<AppState> for Services {
    fn from_ref(state: &AppState) -> Self {
        state.services.clone()
    }
}

impl axum::extract::FromRef<AppState> for Client {
    fn from_ref(state: &AppState) -> Self {
        state.http_client.clone()
    }
}
