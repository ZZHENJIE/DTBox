use sea_orm::DatabaseConnection;
use std::sync::Arc;

#[derive(Clone)]
pub struct State {
    db_conn: DatabaseConnection,
    http_client: Arc<reqwest::Client>,
}

impl State {
    pub fn new(db_conn: DatabaseConnection) -> Self {
        let http_client = reqwest::Client::new();
        Self {
            db_conn,
            http_client: Arc::new(http_client),
        }
    }
    pub fn http_client(&self) -> &reqwest::Client {
        &self.http_client
    }
    pub fn db_conn(&self) -> &DatabaseConnection {
        &self.db_conn
    }
}
