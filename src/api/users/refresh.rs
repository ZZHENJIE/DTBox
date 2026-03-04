use std::sync::Arc;

use argon2::PasswordVerifier;
use axum::{Extension, Json, extract::State};
use axum_extra::extract::CookieJar;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    api::Response,
    app,
    database::entity::refresh_token::{self, Column},
    utils::jwt::Claims,
};

#[derive(Deserialize)]
pub struct Payload {}

pub async fn request(
    Extension(cookie_jar): Extension<CookieJar>,
    State(state): State<Arc<app::State>>,
    Json(_): Json<Payload>,
) -> Response<String> {
    let refresh_token = match cookie_jar.get("refresh_token") {
        Some(value) => value.value(),
        None => return Response::error("Not Find Refresh Token."),
    };
    let user_id: i64 = match cookie_jar.get("user_id") {
        Some(value) => match value.value().parse() {
            Ok(value) => value,
            Err(err) => return Response::error(err.to_string()),
        },
        None => return Response::error("Not Find Refresh Token."),
    };
    // 根据用户ID查找Token Hash
    let token = match refresh_token::Entity::find()
        .filter(Column::UserId.eq(user_id))
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
        .verify_password(refresh_token.as_bytes(), &parsed_hash)
        .is_ok();

    if is_ok {
        // 创建JWT声明
        let claims = Claims::new(token.user_id);

        match claims.encode() {
            Ok(value) => Response::success_with_data(value),
            Err(err) => Response::error(err.to_string()),
        }
    } else {
        Response::error("Incorrect Refresh Token.")
    }
}
