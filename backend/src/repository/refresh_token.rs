use crate::{
    database::{Database, entity::refresh_token},
    error::{AppError, Result},
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

/// Refresh Token repository
#[derive(Debug, Clone)]
pub struct RefreshTokenRepository {
    db: Database,
}

impl RefreshTokenRepository {
    /// Create repository
    pub fn new(db: &Database) -> Self {
        Self { db: db.clone() }
    }

    /// Find by token hash
    pub async fn find_by_hash(&self, token_hash: &str) -> Result<Option<refresh_token::Model>> {
        refresh_token::Entity::find()
            .filter(refresh_token::Column::TokenHash.eq(token_hash))
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)
    }

    /// Find by token ID (jti)
    pub async fn find_by_token_id(&self, token_id: &str) -> Result<Option<refresh_token::Model>> {
        refresh_token::Entity::find()
            .filter(refresh_token::Column::TokenId.eq(token_id))
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)
    }

    /// Find all tokens by user ID
    pub async fn find_by_user_id(&self, user_id: i32) -> Result<Vec<refresh_token::Model>> {
        refresh_token::Entity::find()
            .filter(refresh_token::Column::UserId.eq(user_id))
            .all(self.db.conn())
            .await
            .map_err(AppError::Database)
    }

    /// Create refresh token
    pub async fn create(
        &self,
        user_id: i32,
        token_hash: &str,
        token_id: &str,
        expires_at: chrono::DateTime<chrono::FixedOffset>,
    ) -> Result<refresh_token::Model> {
        // Delete all previous refresh tokens for this user (single login policy)
        let _ = refresh_token::Entity::delete_many()
            .filter(refresh_token::Column::UserId.eq(user_id))
            .exec(self.db.conn())
            .await;

        let token = refresh_token::ActiveModel {
            id: sea_orm::NotSet,
            user_id: Set(user_id),
            token_hash: Set(token_hash.to_string()),
            token_id: Set(token_id.to_string()),
            revoked: Set(false),
            expires_at: Set(expires_at),
            created_at: Set(chrono::Utc::now().into()),
            last_used_at: Set(None),
            use_count: Set(0),
        };

        let token = token
            .insert(self.db.conn())
            .await
            .map_err(AppError::Database)?;

        tracing::info!("Refresh token created: user_id={}", user_id);

        Ok(token)
    }

    /// Mark token as used (update usage time and count)
    pub async fn mark_used(&self, id: i32) -> Result<()> {
        let token = refresh_token::Entity::find_by_id(id)
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)?;

        if let Some(token) = token {
            let mut active: refresh_token::ActiveModel = token.into();
            active.last_used_at = Set(Some(chrono::Utc::now().into()));
            active.use_count = Set(active.use_count.unwrap() + 1);
            active
                .update(self.db.conn())
                .await
                .map_err(AppError::Database)?;
        }

        Ok(())
    }

    /// Revoke token
    pub async fn revoke(&self, id: i32) -> Result<()> {
        let token = refresh_token::Entity::find_by_id(id)
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)?;

        if let Some(token) = token {
            let mut active: refresh_token::ActiveModel = token.into();
            active.revoked = Set(true);
            active
                .update(self.db.conn())
                .await
                .map_err(AppError::Database)?;

            tracing::info!("Refresh token revoked: id={}", id);
        }

        Ok(())
    }

    /// Revoke all tokens by user ID (logout all devices)
    pub async fn revoke_all_by_user(&self, user_id: i32) -> Result<()> {
        let tokens = self.find_by_user_id(user_id).await?;

        for token in tokens {
            let mut active: refresh_token::ActiveModel = token.into();
            active.revoked = Set(true);
            active
                .update(self.db.conn())
                .await
                .map_err(AppError::Database)?;
        }

        tracing::info!("All refresh tokens revoked for user: user_id={}", user_id);

        Ok(())
    }

    /// Delete expired tokens (cleanup task)
    pub async fn delete_expired(&self) -> Result<u64> {
        let now = chrono::Utc::now();
        let result = refresh_token::Entity::delete_many()
            .filter(refresh_token::Column::ExpiresAt.lt(now))
            .exec(self.db.conn())
            .await
            .map_err(AppError::Database)?;

        Ok(result.rows_affected)
    }
}
