use std::sync::Arc;

use argon2::PasswordVerifier;
use axum::{
    Extension, Json,
    extract::State,
    response::{IntoResponse, Response},
};
use axum_extra::extract::CookieJar;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    ErrorCode, api, app,
    database::entity::refresh_token::{self, Column},
    utils::{self, jwt::Claims},
};

#[derive(Deserialize)]
pub struct Payload {}

pub async fn request(
    Extension(cookie_jar): Extension<CookieJar>,
    State(state): State<Arc<app::State>>,
    Json(_): Json<Payload>,
) -> Result<Response, utils::error::Error> {
    let refresh_token = match cookie_jar.get("refresh_token") {
        Some(value) => value.value(),
        None => return Err(ErrorCode::CookieNotFound.into()),
    };
    let user_id: i64 = match cookie_jar.get("user_id") {
        Some(value) => value.value().parse()?,
        None => return Err(ErrorCode::CookieNotFound.into()),
    };

    // 根据用户ID查找Token
    let token = match refresh_token::Entity::find()
        .filter(Column::UserId.eq(user_id))
        .one(state.db_conn())
        .await?
    {
        Some(value) => value,
        None => return Err(ErrorCode::RefreshTokenNotFound.into()),
    };

    // 判断Token是否过期或者失效
    let now = chrono::Utc::now().fixed_offset();
    if now > token.expires_at {
        return Err(ErrorCode::RefreshTokenExpired.into());
    }
    if token.revoked != 0 {
        return Err(ErrorCode::RefreshTokenRevoked.into());
    }

    // 解析Token Hash
    let parsed_hash = argon2::password_hash::PasswordHash::new(&token.token_hash)?;

    // 判断Token是否正确
    let is_ok = argon2::Argon2::default()
        .verify_password(refresh_token.as_bytes(), &parsed_hash)
        .is_ok();

    if is_ok {
        // 创建JWT声明
        let claims = Claims::new(token.user_id);
        let jwt_token = claims.encode()?;

        let data = api::Response::<String> {
            code: 0,
            message: "success".to_string(),
            data: Some(jwt_token),
        };

        Ok(Json(data).into_response())
    } else {
        Err(ErrorCode::RefreshTokenIncorrect.into())
    }
}
