use crate::{
    auth::{Claims, PasswordHasher, RefreshTokenGenerator, TokenPair},
    config::AppConfig,
    database::entity::{refresh_token, user},
    error::{AppError, AuthError, Result},
    repository::Repositories,
};
use chrono::Utc;
use std::sync::Arc;

/// Auth service
#[derive(Debug, Clone)]
pub struct AuthService {
    repos: Repositories,
    config: Arc<AppConfig>,
}

/// Login result
#[derive(Debug, Clone)]
pub struct LoginResult {
    pub user: user::Model,
    pub tokens: TokenPair,
}

/// Token refresh result
#[derive(Debug, Clone)]
pub struct RefreshResult {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: chrono::DateTime<chrono::FixedOffset>,
}

impl AuthService {
    /// Create service
    pub fn new(repos: Repositories, config: Arc<AppConfig>) -> Self {
        Self { repos, config }
    }

    /// User registration
    pub async fn register(&self, username: &str, password: &str) -> Result<user::Model> {
        // Validate input
        if username.len() < 3 || username.len() > 32 {
            return Err(AppError::Validation(
                "Username must be 3-32 characters".to_string(),
            ));
        }

        if password.len() < 6 {
            return Err(AppError::Validation(
                "Password must be at least 6 characters".to_string(),
            ));
        }

        // Hash password
        let password_hash = PasswordHasher::hash(password)?;

        // Create user
        let user = self.repos.user().create(username, &password_hash).await?;

        tracing::info!("User registered: id={}, username={}", user.id, user.username);

        Ok(user)
    }

    /// User login
    pub async fn login(&self, username: &str, password: &str) -> Result<LoginResult> {
        // Find user
        let user: user::Model = self
            .repos
            .user()
            .find_by_username(username)
            .await?
            .ok_or(AppError::Auth(AuthError::InvalidCredentials))?;

        // Verify password
        let password_valid = PasswordHasher::verify(password, &user.password_hash)?;

        if !password_valid {
            tracing::warn!("Login failed - invalid password: username={}", username);
            return Err(AppError::Auth(AuthError::InvalidCredentials));
        }

        // Generate access token
        let access_claims = Claims::new_access(user.id, &self.config);
        let access_token = access_claims.encode(&self.config)?;

        // Generate refresh token
        let refresh_token_plain = RefreshTokenGenerator::generate();
        let refresh_token_hash = RefreshTokenGenerator::hash(&refresh_token_plain)?;

        // Store refresh token (using plaintext token's hash)
        let expires_at = Utc::now() + chrono::Duration::days(self.config.jwt.refresh_token_expires_days);
        self.repos
            .refresh_token()
            .create(user.id, &refresh_token_hash, &refresh_token_plain, expires_at.into())
            .await?;

        tracing::info!("User logged in: id={}, username={}", user.id, user.username);

        Ok(LoginResult {
            user,
            tokens: TokenPair {
                access_token,
                refresh_token: refresh_token_plain,  // Return plaintext token
                access_token_expires_at: Utc::now()
                    + chrono::Duration::minutes(self.config.jwt.access_token_expires_minutes),
                refresh_token_expires_at: expires_at,
            },
        })
    }

    /// Refresh token (只刷新 access_token，不刷新 refresh_token)
    pub async fn refresh_token(&self, refresh_token_plain: &str) -> Result<RefreshResult> {
        // 1. Find token record from database
        let token_record: refresh_token::Model = self
            .repos
            .refresh_token()
            .find_by_token_id(refresh_token_plain)
            .await?
            .ok_or(AppError::Auth(AuthError::RefreshTokenNotFound))?;

        // 2. Check if revoked
        if token_record.revoked {
            return Err(AppError::Auth(AuthError::TokenRevoked));
        }

        // 3. Check if expired
        let now = Utc::now();
        if now > token_record.expires_at {
            return Err(AppError::Auth(AuthError::TokenExpired));
        }

        // 4. Verify token hash (prevent forgery)
        let token_valid = RefreshTokenGenerator::verify(refresh_token_plain, &token_record.token_hash)?;
        if !token_valid {
            return Err(AppError::Auth(AuthError::TokenInvalid));
        }

        // 5. Get user ID
        let user_id = token_record.user_id;

        // 6. Mark token as used
        self.repos.refresh_token().mark_used(token_record.id).await?;

        // 7. Generate new access token (不刷新 refresh_token)
        let new_access_claims = Claims::new_access(user_id, &self.config);
        let new_access_token = new_access_claims.encode(&self.config)?;

        let expires_at = now + chrono::Duration::minutes(self.config.jwt.access_token_expires_minutes);

        tracing::debug!("Token refreshed: user_id={}", user_id);

        Ok(RefreshResult {
            access_token: new_access_token,
            refresh_token: refresh_token_plain.to_string(), // 返回原来的 refresh_token
            expires_at: expires_at.into(),
        })
    }

    /// User logout (revoke current token)
    pub async fn logout(&self, refresh_token_plain: &str) -> Result<()> {
        // 1. Find and revoke (use plaintext token as ID)
        if let Some(token) = self.repos.refresh_token().find_by_token_id(refresh_token_plain).await? {
            self.repos.refresh_token().revoke(token.id).await?;
            tracing::info!("User logged out: user_id={}", token.user_id);
        }

        Ok(())
    }

    /// User logout all devices
    pub async fn logout_all_devices(&self, user_id: i32) -> Result<()> {
        self.repos.refresh_token().revoke_all_by_user(user_id).await?;
        tracing::info!("User logged out from all devices: user_id={}", user_id);
        Ok(())
    }

    /// Verify access token
    pub async fn verify_access_token(&self, token: &str) -> Result<Claims> {
        let claims = Claims::decode(token, &self.config)?;
        claims.verify_access()?;
        Ok(claims)
    }
}
