/// Data access layer (Repository Pattern)
pub mod refresh_token;
pub mod stock;
pub mod user;

use crate::database::Database;
use std::sync::Arc;

/// Repository manager
#[derive(Debug, Clone)]
pub struct Repositories {
    user: Arc<user::UserRepository>,
    refresh_token: Arc<refresh_token::RefreshTokenRepository>,
    stock: Arc<stock::StockRepository>,
}

impl Repositories {
    /// Create all repositories
    pub fn new(db: &Database) -> Self {
        Self {
            user: Arc::new(user::UserRepository::new(db)),
            refresh_token: Arc::new(refresh_token::RefreshTokenRepository::new(db)),
            stock: Arc::new(stock::StockRepository::new(db)),
        }
    }

    /// Get user repository
    pub fn user(&self) -> &user::UserRepository {
        &self.user
    }

    /// Get refresh token repository
    pub fn refresh_token(&self) -> &refresh_token::RefreshTokenRepository {
        &self.refresh_token
    }

    /// Get stock repository
    pub fn stock(&self) -> &stock::StockRepository {
        &self.stock
    }
}

pub use refresh_token::RefreshTokenRepository;
pub use stock::StockRepository;
pub use user::UserRepository;
