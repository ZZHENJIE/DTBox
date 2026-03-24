use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::Deserialize;

use crate::{
    ErrorCode,
    api::API,
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
    ) -> Result<Self::Output, crate::utils::error::Error> {
        match claims {
            Some(claims) => {
                let user_id = claims.sub_data();
                let token = match refresh_token::Entity::find()
                    .filter(Column::UserId.eq(user_id))
                    .one(state.db_conn())
                    .await?
                {
                    Some(token) => token,
                    None => return Err(ErrorCode::RefreshTokenNotFound.into()),
                };
                if token.revoked == 0 {
                    let mut active = token.into_active_model();
                    active.revoked = Set(1);
                    let _ = active.update(state.db_conn()).await?;
                }
                Ok(())
            }
            None => Err(ErrorCode::ClaimsNone.into()),
        }
    }
}
