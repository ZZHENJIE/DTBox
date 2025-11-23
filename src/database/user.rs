use crate::{AppState, Error, ResponseResult, Token};
use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize, Serialize)]
pub struct Authenticate {
    pub user_id: i64,
    pub token: String,
}

#[derive(Deserialize, Serialize)]
pub struct CreateUserPayload {
    pub username: String,
    pub pass_hash: String,
    pub config: serde_json::Value,
}

#[derive(sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub pass_hash: String,
    pub token: Option<String>,
    pub config: serde_json::Value,
    pub create_time: sqlx::types::time::PrimitiveDateTime,
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserPayload>,
) -> ResponseResult<Json<Authenticate>> {
    // Check if there is a user with the same name
    let is_exist = sqlx::query!(
        r#"SELECT EXISTS (SELECT 1 FROM users WHERE name = $1) AS "exists!""#,
        payload.username
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;

    if is_exist.exists {
        return Err(Error::BadRequest(
            "Username is exist,please change username.".to_string(),
        ));
    }
    // create user
    let user = sqlx::query_as!(
        User,
        r#"
            INSERT INTO users (name, pass_hash, token, config)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            "#,
        payload.username,
        payload.pass_hash,
        Token::new(),
        payload.config
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;

    Ok(Json(Authenticate {
        token: user.token.unwrap_or_default(),
        user_id: user.id,
    }))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserPayload>,
) -> ResponseResult<&'static str> {
    Ok("")
}
