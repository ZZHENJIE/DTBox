use crate::{
    api::{API, Response},
    database::entity::users::{self, Column},
};
use chrono::{DateTime, FixedOffset};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct OutputData {
    pub id: i64,
    pub name: String,
    pub config: serde_json::Value,
    pub follow: serde_json::Value,
    pub permissions: i32,
    pub create_time: DateTime<FixedOffset>,
}

#[derive(Deserialize)]
pub struct Output {}

impl API for Output {
    type Output = OutputData;
    async fn request(
        &self,
        claims: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Response<Self::Output> {
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

            return Response::success_with_data(OutputData {
                id: user.id,
                name: user.name,
                config: user.config,
                follow: user.follow,
                permissions: user.permissions,
                create_time: user.create_time,
            });
        }
        Response::error("Claims is None.")
    }
}
