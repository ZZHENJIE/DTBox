use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::Deserialize;

use crate::{
    api::{API, Response},
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
    ) -> crate::api::Response<Self::Output> {
        if let Some(claims) = claims {
            let user_id = claims.sub_data();
            // 根据ID查询用户
            let mut current_user = match users::Entity::find()
                .filter(Column::Id.eq(user_id))
                .one(state.db_conn())
                .await
            {
                Ok(value) => {
                    if let Some(value) = value {
                        value.into_active_model()
                    } else {
                        return Response::error_with_code(
                            -301,
                            format!("User ID {} not found.", user_id),
                        );
                    }
                }
                Err(err) => return Response::error_with_code(-2, err.to_string()),
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
            // 修改数据库内容
            return match current_user.update(state.db_conn()).await {
                Ok(_) => Response::success_with_data(true),
                Err(err) => Response::error_with_code(-3, err.to_string()),
            };
        }
        Response::error_with_code(-104, "Claims is None.")
    }
}
