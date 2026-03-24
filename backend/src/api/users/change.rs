use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::Deserialize;

use crate::{
    ErrorCode,
    api::API,
    database::entity::users::{self, Column},
};

#[derive(Deserialize, Debug)]
#[serde(tag = "type", content = "data")]
pub enum Event {
    Name(String),
    Config(serde_json::Value),
}

impl API for Event {
    type Output = bool;
    async fn request(
        &self,
        claims: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        match claims {
            Some(claims) => {
                let user_id = claims.sub_data();
                // 根据ID查询用户
                let mut current_user = match users::Entity::find()
                    .filter(Column::Id.eq(user_id))
                    .one(state.db_conn())
                    .await?
                {
                    Some(value) => value.into_active_model(),
                    None => return Err(ErrorCode::UserNotFound.into()),
                };

                // 匹配处理事件
                match self {
                    Event::Name(name) => {
                        current_user.name = Set(name.clone());
                    }
                    Event::Config(config) => {
                        current_user.config = Set(config.clone());
                    }
                }
                let _ = current_user.update(state.db_conn()).await?;
                Ok(true)
            }
            None => Err(ErrorCode::ClaimsNone.into()),
        }
    }
}
