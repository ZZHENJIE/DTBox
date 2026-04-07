pub mod api;
pub mod auth;
pub mod config;
pub mod database;
pub mod error;
pub mod logger;
pub mod middleware;
pub mod repository;
pub mod service;
pub mod state;

// Re-export common types
pub use auth::{Claims, PasswordHasher, RefreshTokenGenerator, TokenPair};
pub use config::AppConfig;
pub use error::{AppError, AuthError, BusinessError, Result};
