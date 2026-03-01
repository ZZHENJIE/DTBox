use argon2::PasswordVerifier;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::refresh_token::{self, Column},
    utils::jwt::Claims,
};

#[derive(Deserialize)]
pub struct Payload {
    pub user_id: i64,
    pub token: String,
}

impl API for Payload {
    type Output = bool;
    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Response<Self::Output> {
        // 根据用户ID查找Token
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

        // 判断Token是否过期
        let now = chrono::Utc::now().fixed_offset();
        if now > token.expires_at {
            return Response::error("Refresh Token expired.");
        }

        // 解析Token Hash
        let parsed_hash = match argon2::password_hash::PasswordHash::new(&token.token_hash) {
            Ok(value) => value,
            Err(err) => return Response::error(err.to_string()),
        };

        // 判断Token是否正确
        let is_ok = argon2::Argon2::default()
            .verify_password(self.token.as_bytes(), &parsed_hash)
            .is_ok();

        if is_ok {
            // 创建JWT声明
            let claims = Claims::new(token.user_id);

            match claims.encode() {
                Ok(value) => Response::success_with_token(true, value),
                Err(err) => Response::error(err.to_string()),
            }
        } else {
            Response::error("Incorrect Refresh Token.")
        }
    }
}
