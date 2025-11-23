use crate::{AppState, Error, ResponseResult, Token};
use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize, Serialize)]
pub struct Authenticate {
    pub id: i32,
    pub token: String,
}

#[derive(Deserialize, Serialize)]
pub struct Login {
    pub name: String,
    pub pass_hash: String,
}

#[derive(Deserialize, Serialize)]
pub struct CreateUserPayload {
    pub name: String,
    pub pass_hash: String,
    pub config: serde_json::Value,
}

#[derive(Deserialize, Serialize)]
pub struct UpdateUserPayload {
    pub id: i32,
    pub name: String,
    pub pass_hash: String,
    pub token: String,
    pub config: serde_json::Value,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub pass_hash: String,
    pub token: String,
    pub config: serde_json::Value,
    pub create_time: chrono::NaiveDateTime,
}

pub async fn name_is_exist(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
) -> ResponseResult<Json<bool>> {
    let is_exist = sqlx::query!(
        r#"SELECT EXISTS (SELECT 1 FROM users WHERE name = $1) AS "exists!""#,
        name
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;
    Ok(Json(is_exist.exists))
}

pub async fn create(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserPayload>,
) -> ResponseResult<Json<Authenticate>> {
    let user = sqlx::query_as!(
        User,
        r#"
            INSERT INTO users (name, pass_hash, token, config)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            "#,
        payload.name,
        payload.pass_hash,
        Token::new(),
        payload.config
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;

    Ok(Json(Authenticate {
        token: user.token,
        id: user.id,
    }))
}

pub async fn get(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Authenticate>,
) -> ResponseResult<Json<User>> {
    let user = sqlx::query_as!(User, r#"SELECT * FROM users WHERE id = $1"#, payload.id)
        .fetch_one(state.database_pool())
        .await
        .map_err(Error::DataBase)?;

    if user.token != payload.token {
        return Err(Error::AuthError("Expired login.".to_string()));
    }

    Ok(Json(user))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Login>,
) -> ResponseResult<Json<Authenticate>> {
    let user = sqlx::query_as!(
        User,
        r#"SELECT * FROM users WHERE name = $1 AND pass_hash = $2"#,
        payload.name,
        payload.pass_hash
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;

    let new_token_user = sqlx::query_as!(
        User,
        r#"
            UPDATE users
            SET token = $1
            WHERE id = $2
            RETURNING *
        "#,
        Token::new(),
        user.id
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;

    Ok(Json(Authenticate {
        token: new_token_user.token,
        id: new_token_user.id,
    }))
}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateUserPayload>,
) -> ResponseResult<Json<Authenticate>> {
    let user = sqlx::query_as!(User, r#"SELECT * FROM users WHERE id = $1"#, payload.id)
        .fetch_one(state.database_pool())
        .await
        .map_err(Error::DataBase)?;

    if user.token != payload.token {
        return Err(Error::AuthError("Expired login.".to_string()));
    }

    let updated_user = sqlx::query_as!(
        User,
        r#"
            UPDATE users
            SET name = $1, pass_hash = $2, token = $3, config = $4
            WHERE id = $5
            RETURNING *
            "#,
        payload.name,
        payload.pass_hash,
        Token::new(),
        payload.config,
        payload.id
    )
    .fetch_one(state.database_pool())
    .await
    .map_err(Error::DataBase)?;

    Ok(Json(Authenticate {
        token: updated_user.token,
        id: updated_user.id,
    }))
}
