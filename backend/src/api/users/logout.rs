use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::refresh_token::{self, Column},
};

#[derive(Deserialize)]
pub struct Output {}

impl API for Output {
    type Output = ();
    async fn request(
        &self,
        claims: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        if let Some(claims) = claims {
            let user_id = claims.sub_data();
            let token = match refresh_token::Entity::find()
                .filter(Column::UserId.eq(user_id))
                .one(state.db_conn())
                .await
            {
                Ok(value) => {
                    if let Some(value) = value {
                        value
                    } else {
                        return Response::error_with_code(-201, "Refresh Token not found.");
                    }
                }
                Err(err) => return Response::error_with_code(-2, err.to_string()),
            };
            if token.revoked == 0 {
                let mut active = token.into_active_model();
                active.revoked = Set(1);
                match active.update(state.db_conn()).await {
                    Ok(_) => {}
                    Err(err) => return Response::error_with_code(-3, err.to_string()),
                };
            }
            return Response::success();
        }
        Response::error_with_code(-104, "Claims is None.")
    }
}
