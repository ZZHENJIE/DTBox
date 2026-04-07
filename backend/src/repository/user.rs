use crate::{
    database::{Database, entity::user},
    error::{AppError, BusinessError, Result},
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, Set};

/// User repository
#[derive(Debug, Clone)]
pub struct UserRepository {
    db: Database,
}

impl UserRepository {
    /// Create repository
    pub fn new(db: &Database) -> Self {
        Self { db: db.clone() }
    }

    /// Find user by ID
    pub async fn find_by_id(&self, id: i32) -> Result<Option<user::Model>> {
        user::Entity::find_by_id(id)
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)
    }

    /// Find user by username
    pub async fn find_by_username(&self, username: &str) -> Result<Option<user::Model>> {
        user::Entity::find()
            .filter(user::Column::Username.eq(username))
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)
    }

    /// Check if username exists
    pub async fn exists_by_username(&self, username: &str) -> Result<bool> {
        let count: u64 = user::Entity::find()
            .filter(user::Column::Username.eq(username))
            .count(self.db.conn())
            .await
            .map_err(AppError::Database)?;
        Ok(count > 0)
    }

    /// Create new user
    pub async fn create(
        &self,
        username: &str,
        password_hash: &str,
    ) -> Result<user::Model> {
        // Check if username already exists
        if self.exists_by_username(username).await? {
            return Err(AppError::Business(BusinessError::UserAlreadyExists));
        }

        let now = chrono::Utc::now();
        let user = user::ActiveModel {
            username: Set(username.to_string()),
            password_hash: Set(password_hash.to_string()),
            config: Set(serde_json::json!({})),
            permissions: Set(0),
            created_at: Set(now.into()),
            updated_at: Set(now.into()),
            ..Default::default()
        };

        let user = user.insert(self.db.conn()).await.map_err(AppError::Database)?;
        
        tracing::info!("User created: id={}, username={}", user.id, user.username);
        
        Ok(user)
    }

    /// Update user info
    pub async fn update(&self, id: i32, username: Option<&str>, config: Option<serde_json::Value>) -> Result<user::Model> {
        let user = self.find_by_id(id).await?;
        
        let user = match user {
            Some(u) => u,
            None => return Err(AppError::Business(BusinessError::NotFound)),
        };

        let mut active: user::ActiveModel = user.into();
        
        if let Some(name) = username {
            active.username = Set(name.to_string());
        }
        
        if let Some(cfg) = config {
            active.config = Set(cfg);
        }
        
        active.updated_at = Set(chrono::Utc::now().into());
        
        let updated = active.update(self.db.conn()).await.map_err(AppError::Database)?;
        
        tracing::info!("User updated: id={}", id);
        
        Ok(updated)
    }

    /// Update password
    pub async fn update_password(&self, id: i32, new_password_hash: &str) -> Result<()> {
        let user = self.find_by_id(id).await?;
        
        if user.is_none() {
            return Err(AppError::Business(BusinessError::NotFound));
        }

        let mut active: user::ActiveModel = user.unwrap().into();
        active.password_hash = Set(new_password_hash.to_string());
        active.updated_at = Set(chrono::Utc::now().into());
        
        let _: user::Model = active.update(self.db.conn()).await.map_err(AppError::Database)?;
        
        tracing::info!("User password updated: id={}", id);
        
        Ok(())
    }

    /// Update permissions
    pub async fn update_permissions(&self, id: i32, permissions: i32) -> Result<()> {
        let user = self.find_by_id(id).await?;
        
        if user.is_none() {
            return Err(AppError::Business(BusinessError::NotFound));
        }

        let mut active: user::ActiveModel = user.unwrap().into();
        active.permissions = Set(permissions);
        active.updated_at = Set(chrono::Utc::now().into());
        
        let _: user::Model = active.update(self.db.conn()).await.map_err(AppError::Database)?;
        
        tracing::info!("User permissions updated: id={}, permissions={}", id, permissions);
        
        Ok(())
    }
}
