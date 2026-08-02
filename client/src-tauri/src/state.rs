use std::sync::RwLock;

#[derive(Default)]
pub struct AppState {
    pub access_token: RwLock<Option<String>>,
    pub user_id: RwLock<Option<i32>>,
    pub server_url: RwLock<String>,
}
