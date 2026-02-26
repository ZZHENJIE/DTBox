use argon2::PasswordVerifier;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::refresh_token::{self, Column},
    utils::jwt::Claims,
};

#[derive(Deserialize)]
pub struct RefreshPayload {
    pub user_id: i64,
    pub token: String,
}

impl API for RefreshPayload {
    type Output = bool;
    async fn request(
        &self,
        state: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        let token = match refresh_token::Entity::find()
            .filter(Column::UserId.eq(self.user_id))
            .one(state.db_conn())
            .await
        {
            Ok(value) => {
                if let Some(value) = value {
                    value
                } else {
                    return Response::error("Refresh Token not found.");
                }
            }
            Err(err) => return Response::error(err.to_string()),
        };

        let now = chrono::Utc::now().fixed_offset();
        if now > token.expires_at {
            return Response::error("Refresh Token expired.");
        }

        let parsed_hash = match argon2::password_hash::PasswordHash::new(&token.token_hash) {
            Ok(value) => value,
            Err(err) => return Response::error(err.to_string()),
        };

        let is_ok = argon2::Argon2::default()
            .verify_password(self.token.as_bytes(), &parsed_hash)
            .is_ok();

        if !is_ok {
            return Response::error("Invalid Refresh Token.");
        }

        let claims = Claims::new(token.user_id);

        match claims.encode() {
            Ok(value) => Response::success_with_token(true, value),
            Err(err) => Response::error(err.to_string()),
        }
    }
}
