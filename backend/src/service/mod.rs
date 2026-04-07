/// Business logic layer (Service Layer)
pub mod auth;
pub mod market;
pub mod user;

use crate::{config::AppConfig, repository::Repositories};
use reqwest::Client;
use std::sync::Arc;

/// Service container
#[derive(Debug, Clone)]
pub struct Services {
    pub auth: Arc<auth::AuthService>,
    pub user: Arc<user::UserService>,
    pub market: Arc<market::MarketService>,
    pub config: Arc<AppConfig>,
    pub http_client: Client,
}

impl Services {
    /// Create all services
    pub fn new(repos: Repositories, config: Arc<AppConfig>, http_client: Client) -> Self {
        Self {
            auth: Arc::new(auth::AuthService::new(repos.clone(), config.clone())),
            user: Arc::new(user::UserService::new(repos.clone(), config.clone())),
            market: Arc::new(market::MarketService::new(
                repos,
                http_client.clone(),
                config.clone(),
            )),
            config,
            http_client,
        }
    }

    /// Get auth service
    pub fn auth(&self) -> &auth::AuthService {
        &self.auth
    }

    /// Get user service
    pub fn user(&self) -> &user::UserService {
        &self.user
    }

    /// Get market data service
    pub fn market(&self) -> &market::MarketService {
        &self.market
    }
}

pub use auth::AuthService;
pub use market::MarketService;
pub use user::UserService;
