pub mod config;
pub mod db;
pub mod entity;
pub mod handler;
pub mod middleware;
pub mod service;
pub mod util;

use redis::aio::MultiplexedConnection;
use sea_orm::DatabaseConnection;

#[derive(Clone)]
pub struct Source {
    pub finviz: finviz_sdk::Client,
    pub alpaca: alpaca_sdk::Client,
}

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub redis: Option<MultiplexedConnection>,
    pub config: config::Config,
    pub reqwest_client: reqwest::Client,
    pub source: Source,
}

impl axum::extract::FromRef<AppState> for DatabaseConnection {
    fn from_ref(state: &AppState) -> Self {
        state.db.clone()
    }
}

impl axum::extract::FromRef<AppState> for Option<MultiplexedConnection> {
    fn from_ref(state: &AppState) -> Self {
        state.redis.clone()
    }
}

impl axum::extract::FromRef<AppState> for config::Config {
    fn from_ref(state: &AppState) -> Self {
        state.config.clone()
    }
}
