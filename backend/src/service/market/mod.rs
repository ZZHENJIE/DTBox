use crate::{config::AppConfig, error::Result, repository::Repositories};
use reqwest::Client;
use std::sync::Arc;

pub mod finviz;
pub mod integrations;

/// Market data service
#[derive(Debug, Clone)]
pub struct MarketService {
    repos: Repositories,
    /// Finviz service
    finviz: finviz::Finviz,
    /// Integration service
    integrations: integrations::Integrations,
}

impl MarketService {
    /// Create service
    pub fn new(repos: Repositories, http_client: Client, config: Arc<AppConfig>) -> Self {
        let finviz = finviz::Finviz::new(http_client.clone(), config.finviz.api_key.clone());
        let integrations = integrations::Integrations::new(http_client.clone());
        Self {
            repos,
            finviz,
            integrations,
        }
    }

    /// Finviz service
    pub fn finviz(&self) -> &finviz::Finviz {
        &self.finviz
    }

    /// Integration service
    pub fn integrations(&self) -> &integrations::Integrations {
        &self.integrations
    }

    /// Search stocks
    pub async fn search_stocks(
        &self,
        query: &str,
        limit: u64,
    ) -> Result<Vec<crate::database::entity::stock::Model>> {
        self.repos.stock().search(query, limit).await
    }
}
