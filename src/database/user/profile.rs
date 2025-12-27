use crate::{AppState, Error, database::user::operation::find_for_id};
use axum::{Extension, Json, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Deserialize, Serialize)]
pub struct Profile {
    pub id: i32,
    pub name: String,
    pub config: serde_json::Value,
    pub follow: Option<Vec<String>>,
    pub create_time: chrono::DateTime<chrono::Utc>,
}

pub async fn fetch(
    State(state): State<Arc<AppState>>,
    Extension(user_id): Extension<i32>,
) -> Result<Json<Profile>, Error> {
    let user = find_for_id(user_id, state.database_pool()).await?;
    if let Some(user) = user {
        let profile = Profile {
            id: user.id,
            name: user.name,
            config: user.config,
            follow: user.follow,
            create_time: user.create_time,
        };
        Ok(Json(profile))
    } else {
        Err(Error::NotFound)
    }
}
