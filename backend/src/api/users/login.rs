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
    ErrorCode, api, app,
    database::entity::{
        refresh_token,
        users::{self, Column},
    },
    utils::{self, hash},
};

#[derive(Deserialize)]
pub struct Payload {
    pub name: String,
    pub password: String,
}

pub async fn request(
    State(state): State<Arc<app::State>>,
    Json(payload): Json<Payload>,
) -> Result<Response, utils::error::Error> {
    // 使用用户名查找用户
    let user = match users::Entity::find()
        .filter(Column::Name.eq(payload.name.clone()))
        .one(state.db_conn())
        .await?
    {
        Some(value) => value,
        None => return Err(ErrorCode::UserNotFound.into()),
    };
    // 解析密码Hash
    let parsed_hash = argon2::password_hash::PasswordHash::new(&user.pass_hash)?;

    // 判断密码是否正确
    let is_ok = argon2::Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_ok();

    if is_ok {
        // 生成Token
        let token = uuid::Uuid::new_v4().to_string();
        // 生成Hash值
        let token_hash = hash(token.as_bytes())?;

        let now = Utc::now();
        let expires_at = now + chrono::Duration::days(7);

        // 删除该用户以前的Token记录
        let _ = refresh_token::Entity::delete_by_id(user.id)
            .exec(state.db_conn())
            .await?;

        // 创建Token记录
        let refresh_token = refresh_token::ActiveModel {
            user_id: Set(user.id),
            token_hash: Set(token_hash),
            issued_at: Set(now.into()),
            expires_at: Set(expires_at.into()),
            revoked: Set(0),
        };

        // 写入数据库
        let _ = refresh_token::Entity::insert(refresh_token)
            .exec(state.db_conn())
            .await?;

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

        let data = api::Response::<()> {
            code: 0,
            message: "success".to_string(),
            data: None,
        };

        Ok((jar, Json(data)).into_response())
    } else {
        Err(ErrorCode::PasswordIncorrect.into())
    }
}
