use std::sync::Arc;

use argon2::PasswordVerifier;
use axum::{
    Json,
    extract::State,
    response::{IntoResponse, Response},
};
use axum_extra::extract::{
    CookieJar,
    cookie::{self, Cookie},
};
use chrono::Utc;
use sea_orm::{ActiveValue::Set, ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    api, app,
    database::entity::{
        refresh_token,
        users::{self, Column},
    },
    utils::hash,
};

fn response_error(err: impl Into<String>) -> Response {
    api::Response::<()>::error(err).into_response()
}

#[derive(Deserialize)]
pub struct Payload {
    pub name: String,
    pub password: String,
}

pub async fn request(
    State(state): State<Arc<app::State>>,
    Json(payload): Json<Payload>,
) -> Response {
    // 使用用户名查找用户
    let user = match users::Entity::find()
        .filter(Column::Name.eq(payload.name.clone()))
        .one(state.db_conn())
        .await
    {
        Ok(value) => {
            if let Some(value) = value {
                value
            } else {
                return response_error(format!("User {} not found.", payload.name));
            }
        }
        Err(err) => return response_error(err.to_string()),
    };

    // 解析密码Hash
    let parsed_hash = match argon2::password_hash::PasswordHash::new(&user.pass_hash) {
        Ok(value) => value,
        Err(err) => return response_error(err.to_string()),
    };

    // 判断密码是否正确
    let is_ok = argon2::Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_ok();

    if is_ok {
        // 生成Token
        let token = uuid::Uuid::new_v4().to_string();
        // 生成Hash值
        let token_hash = match hash(token.as_bytes()) {
            Ok(value) => value,
            Err(err) => return response_error(err.to_string()),
        };

        let now = Utc::now();
        let expires_at = now + chrono::Duration::days(7);

        // 删除该用户以前的Token记录
        if let Err(err) = refresh_token::Entity::delete_by_id(user.id)
            .exec(state.db_conn())
            .await
        {
            return response_error(err.to_string());
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
            Ok(_) => {
                let jar = CookieJar::new()
                    .add(
                        Cookie::build(("refresh_token", token.clone()))
                            .http_only(true)
                            .secure(true)
                            .same_site(cookie::SameSite::Lax)
                            .path("/")
                            .build(),
                    )
                    .add(
                        Cookie::build(("user_id", user.id.to_string()))
                            .http_only(true)
                            .secure(true)
                            .same_site(cookie::SameSite::Lax)
                            .path("/")
                            .build(),
                    );

                jar.into_response()
            }
            Err(err) => response_error(err.to_string()),
        }
    } else {
        response_error("Incorrect Password.")
    }
}
