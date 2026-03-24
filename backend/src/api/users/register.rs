use sea_orm::{ActiveValue::Set, EntityTrait};
use serde::Deserialize;

use crate::{api::API, database::entity::users, utils::hash};

#[derive(Deserialize)]
pub struct Payload {
    pub name: String,
    pub password: String,
}

impl API for Payload {
    type Output = bool;

    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        let pass_hash = hash(self.password.as_bytes())?;
        let user = users::ActiveModel {
            name: Set(self.name.clone()),
            pass_hash: Set(pass_hash),
            config: Set(serde_json::json!(
                {
                    "follow":[]
                }
            )),
            permissions: Set(0),
            create_time: Set(chrono::Utc::now().into()),
            ..Default::default()
        };
        let _ = users::Entity::insert(user).exec(state.db_conn()).await?;
        Ok(true)
    }
}
