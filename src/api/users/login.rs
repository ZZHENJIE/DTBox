use argon2::PasswordVerifier;
use chrono::{Duration, Utc};
use sea_orm::{ActiveValue::Set, ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::{
        refresh_token,
        users::{self, Column},
    },
    utils::hash,
};

#[derive(Deserialize)]
pub struct LoginPayload {
    pub name: String,
    pub password: String,
}

impl API for LoginPayload {
    type Output = bool;
    async fn request(
        &self,
        state: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        // 使用用户名查找用户
        let user = match users::Entity::find()
            .filter(Column::Name.eq(self.name.clone()))
            .one(state.db_conn())
            .await
        {
            Ok(value) => {
                if let Some(value) = value {
                    value
                } else {
                    return Response::error(format!("User {} not found.", self.name));
                }
            }
            Err(err) => return Response::error(err.to_string()),
        };

        // 解析密码Hash
        let parsed_hash = match argon2::password_hash::PasswordHash::new(&user.pass_hash) {
            Ok(value) => value,
            Err(err) => return Response::error(err.to_string()),
        };

        // 判断密码是否正确
        let is_ok = argon2::Argon2::default()
            .verify_password(self.password.as_bytes(), &parsed_hash)
            .is_ok();

        if is_ok {
            // 生成Token
            let token = uuid::Uuid::new_v4().to_string();
            // 生成Hash值
            let token_hash = match hash(token.as_bytes()) {
                Ok(value) => value,
                Err(err) => return Response::error(err.to_string()),
            };

            let now = Utc::now();
            let expires_at = now + Duration::days(7);

            // 删除该用户以前的Token记录
            if let Err(err) = refresh_token::Entity::delete_by_id(user.id)
                .exec(state.db_conn())
                .await
            {
                return Response::error(err.to_string());
            }

            // 创建Token记录
            let refresh_token = refresh_token::ActiveModel {
                user_id: Set(user.id),
                token_hash: Set(token_hash),
                issued_at: Set(now.into()),
                expires_at: Set(expires_at.into()),
                revoked: Set(0),
                ..Default::default()
            };

            // 写入数据库并返回Token
            match refresh_token::Entity::insert(refresh_token)
                .exec(state.db_conn())
                .await
            {
                Ok(_) => Response::success_with_token(true, token),
                Err(err) => Response::error(err.to_string()),
            }
        } else {
            Response::success_with_data(false)
        }
    }
}
