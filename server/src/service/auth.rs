use crate::config::Config;
use crate::entity::refresh_tokens;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set,
};
use sha2::{Digest, Sha256};
use uuid::Uuid;

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

pub async fn store_refresh_token(
    db: &DatabaseConnection,
    user_id: i32,
    config: &Config,
) -> Result<String, Box<dyn std::error::Error>> {
    let token = Uuid::new_v4().to_string();
    let token_hash = hash_token(&token);
    let expires_at = chrono::Utc::now()
        + chrono::Duration::days(config.jwt.refresh_token_expire_days as i64);

    let existing = refresh_tokens::Entity::find()
        .filter(refresh_tokens::Column::UserId.eq(user_id))
        .one(db)
        .await?;

    if let Some(model) = existing {
        let mut active: refresh_tokens::ActiveModel = model.into();
        active.token_hash = Set(token_hash);
        active.revoked = Set(false);
        active.expires_at = Set(expires_at.naive_utc());
        active.created_at = Set(chrono::Utc::now().naive_utc());
        active.update(db).await?;
    } else {
        let model = refresh_tokens::ActiveModel {
            user_id: Set(user_id),
            token_hash: Set(token_hash),
            revoked: Set(false),
            expires_at: Set(expires_at.naive_utc()),
            created_at: Set(chrono::Utc::now().naive_utc()),
            ..Default::default()
        };
        model.insert(db).await?;
    }

    Ok(token)
}

pub async fn revoke_refresh_token(
    db: &DatabaseConnection,
    user_id: i32,
) -> Result<(), Box<dyn std::error::Error>> {
    let model = refresh_tokens::Entity::find()
        .filter(refresh_tokens::Column::UserId.eq(user_id))
        .one(db)
        .await?;

    if let Some(model) = model {
        let mut active: refresh_tokens::ActiveModel = model.into();
        active.revoked = Set(true);
        active.update(db).await?;
    }

    Ok(())
}

pub async fn verify_refresh_token(
    db: &DatabaseConnection,
    token: &str,
) -> Result<i32, Box<dyn std::error::Error>> {
    let token_hash = hash_token(token);

    let model = refresh_tokens::Entity::find()
        .filter(refresh_tokens::Column::TokenHash.eq(&token_hash))
        .one(db)
        .await?
        .ok_or("RefreshToken not found")?;

    if model.revoked {
        return Err("RefreshToken has been revoked".into());
    }

    if model.expires_at < chrono::Utc::now().naive_utc() {
        return Err("RefreshToken has expired".into());
    }

    Ok(model.user_id)
}
