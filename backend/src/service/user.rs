use crate::{
    config::AppConfig,
    database::entity::user,
    error::{AppError, BusinessError, Result},
    repository::Repositories,
};
use std::sync::Arc;

/// User service
#[derive(Debug, Clone)]
pub struct UserService {
    repos: Repositories,
    _config: Arc<AppConfig>,
}

impl UserService {
    /// Create service
    pub fn new(repos: Repositories, config: Arc<AppConfig>) -> Self {
        Self { repos, _config: config }
    }

    /// Get user info
    pub async fn get_user_info(&self, user_id: i32) -> Result<UserInfo> {
        let user: user::Model = self
            .repos
            .user()
            .find_by_id(user_id)
            .await?
            .ok_or(AppError::Business(BusinessError::NotFound))?;

        Ok(UserInfo::from(user))
    }

    /// Update user info
    pub async fn update_user(
        &self,
        user_id: i32,
        updates: UserUpdate,
    ) -> Result<UserInfo> {
        // If updating username, check if it already exists
        if let Some(ref username) = updates.username {
            if self.repos.user().exists_by_username(username).await? {
                return Err(AppError::Business(BusinessError::UserAlreadyExists));
            }
        }

        let user = self
            .repos
            .user()
            .update(user_id, updates.username.as_deref(), updates.config)
            .await?;

        Ok(UserInfo::from(user))
    }

    /// Check if username is available
    pub async fn check_username_available(&self, username: &str) -> Result<bool> {
        let exists = self.repos.user().exists_by_username(username).await?;
        Ok(!exists)
    }

    /// Get all users (admin feature)
    pub async fn list_users(&self, _admin_id: i32) -> Result<Vec<UserInfo>> {
        // TODO: implement pagination and permission check
        // Simplified for now
        Ok(vec![])
    }

    /// Update user password
    pub async fn update_password(
        &self,
        user_id: i32,
        old_password: &str,
        new_password: &str,
    ) -> Result<()> {
        // Get user
        let user = self.repos.user().find_by_id(user_id).await?;
        let user = user.ok_or(AppError::Business(BusinessError::NotFound))?;

        // Verify old password
        use crate::auth::PasswordHasher;
        let password_valid = PasswordHasher::verify(old_password, &user.password_hash)?;
        if !password_valid {
            return Err(AppError::Auth(crate::error::AuthError::InvalidCredentials));
        }

        // Validate new password length
        if new_password.len() < 6 {
            return Err(AppError::Validation("Password must be at least 6 characters".to_string()));
        }

        // Hash new password
        let new_hash = PasswordHasher::hash(new_password)?;

        // Update password
        self.repos.user().update_password(user_id, &new_hash).await
    }
}

/// User info DTO
#[derive(Debug, Clone, serde::Serialize)]
pub struct UserInfo {
    pub id: i32,
    pub username: String,
    pub permissions: i32,
    pub config: serde_json::Value,
    pub created_at: String,
}

impl From<user::Model> for UserInfo {
    fn from(user: user::Model) -> Self {
        Self {
            id: user.id,
            username: user.username,
            permissions: user.permissions,
            config: user.config,
            created_at: user.created_at.to_string(),
        }
    }
}

/// User update request
#[derive(Debug, Clone, Default)]
pub struct UserUpdate {
    pub username: Option<String>,
    pub config: Option<serde_json::Value>,
}
