use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::users::{self, Column},
};

#[derive(Deserialize)]
pub struct Payload {
    pub name: String,
}

impl API for Payload {
    type Output = bool;
    async fn request(
        &self,
        claims: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        if let Some(claims) = claims {
            let user_id = claims.sub_data();
            // 根据ID查询用户
            let user = match users::Entity::find()
                .filter(Column::Id.eq(user_id))
                .one(state.db_conn())
                .await
            {
                Ok(value) => {
                    if let Some(value) = value {
                        value
                    } else {
                        return Response::error(format!("User ID {} not found.", user_id));
                    }
                }
                Err(err) => return Response::error(err.to_string()),
            };
            // 更新用户名字
            let mut active_model = user.into_active_model();
            active_model.name = Set(self.name.clone());
            return match active_model.update(state.db_conn()).await {
                Ok(_) => Response::success_with_data(true),
                Err(err) => Response::error(err.to_string()),
            };
        }
        Response::error("Claims is None.")
    }
}
