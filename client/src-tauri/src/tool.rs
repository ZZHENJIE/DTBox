use std::sync::Arc;

use crate::api;
use crate::state::AppState;

pub async fn fetch_timestamp(state: &Arc<AppState>) -> Result<u64, String> {
    api::get_with_auth(state, "/api/tool/timestamp/akamai").await
}
