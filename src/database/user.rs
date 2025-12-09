use crate::{AppState, Error, ResponseResult, Token};
use axum::{
    Json,
    extract::{Path, State},
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub enum StatusCode {
    TOKENINVALID,
    USERNOTFOUND,
}

#[derive(Deserialize, Serialize)]
pub struct CreatePayload {
    pub name: String,
    pub pass_hash: String,
    pub config: serde_json::Value,
}

#[derive(Deserialize, Serialize)]
pub struct LoginPayload {
    pub name: String,
    pub pass_hash: String,
}

#[derive(Deserialize, Serialize)]
pub struct UpdatePayload {
    pub id: i32,
    pub name: String,
    pub token: String,
}

#[derive(Deserialize, Serialize)]
pub struct ChangePasswordPayload {
    pub id: i32,
    pub old_pass_token: String,
    pub token: String,
    pub new_pass_token: String,
}

#[derive(Deserialize, Serialize)]
pub struct AuthenticatePayload {
    pub id: i32,
    pub token: String,
}

#[derive(Deserialize, Serialize)]
pub struct InfoResult {
    pub id: i32,
    pub name: String,
    pub config: serde_json::Value,
    pub create_time: chrono::NaiveDateTime,
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
    Json(payload): Json<CreatePayload>,
) -> ResponseResult<Json<AuthenticatePayload>> {
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

    Ok(Json(AuthenticatePayload {
        token: user.token,
        id: user.id,
    }))
}

pub async fn info(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthenticatePayload>,
) -> ResponseResult<Json<InfoResult>> {
    let user = get_item(payload.id, state.database_pool()).await?;

    if user.token != payload.token {
        return Err(Error::AuthError("Expired login.".to_string()));
    }

    Ok(Json(InfoResult {
        id: user.id,
        name: user.name,
        config: user.config,
        create_time: user.create_time,
    }))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginPayload>,
) -> ResponseResult<Json<AuthenticatePayload>> {
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

    Ok(Json(AuthenticatePayload {
        token: new_token_user.token,
        id: new_token_user.id,
    }))
}

pub async fn change_password(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ChangePasswordPayload>,
) {
    let user = get_item(payload.id, state.database_pool()).await?;

    if(user.pass_hash != )


}

pub async fn update(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdatePayload>,
) -> ResponseResult<Json<bool>> {
    let user = get_item(payload.id, state.database_pool()).await?;

    if user.token != payload.token {
        return Err(Error::AuthError("Expired login.".to_string()));
    }

    let updated_user = sqlx::query_as!(
        User,
        r#"
            UPDATE users
            SET name = $1, config = $4
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

    Ok(Json(true))
}

async fn get_item(id: i32, pool: &sqlx::Pool<sqlx::Postgres>) -> Result<User, crate::Error> {
    let user = sqlx::query_as!(User, r#"SELECT * FROM users WHERE id = $1"#, id)
        .fetch_one(pool)
        .await
        .map_err(Error::DataBase)?;
    Ok(user)
}
