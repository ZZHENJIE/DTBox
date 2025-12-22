use crate::{Api, Error};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct NameIsExists {
    pub name: String,
}

impl Api for NameIsExists {
    type Output = bool;
    type Error = Error;

    async fn fetch(
        &self,
        state: std::sync::Arc<crate::AppState>,
    ) -> Result<Self::Output, Self::Error> {
        let exists = sqlx::query_scalar!(
            "SELECT EXISTS(SELECT 1 FROM users WHERE name = $1)",
            self.name
        )
        .fetch_one(state.database_pool())
        .await?
        .unwrap_or(false);

        Ok(exists)
    }
}
