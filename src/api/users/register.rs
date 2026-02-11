use sea_orm::{ActiveValue::Set, EntityTrait};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::users,
    utils::hash,
};

#[derive(Deserialize)]
pub struct RegisterPayload {
    pub name: String,
    pub password: String,
}

impl API for RegisterPayload {
    type Output = bool;
    async fn request(&self, state: std::sync::Arc<crate::app::State>) -> Response<Self::Output> {
        let pass_hash = match hash(self.password.as_bytes()) {
            Ok(value) => value,
            Err(err) => return Response::error(err),
        };
        let user = users::ActiveModel {
            name: Set(self.name.clone()),
            pass_hash: Set(pass_hash),
            config: Set("{}".to_string()),
            follow: Set("[]".to_string()),
            permissions: Set(0),
            create_time: Set(chrono::Utc::now().into()),
            ..Default::default()
        };
        match users::Entity::insert(user).exec(state.db_conn()).await {
            Ok(_) => Response::success_with_data(true),
            Err(err) => Response::error(err.to_string()),
        }
    }
}
