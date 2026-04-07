use crate::{
    config::AppConfig,
    error::{AppError, AuthError, Result},
};
use chrono::{DateTime, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

/// JWT Claims
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// JWT ID (for tracking and revocation)
    pub jti: String,
    /// Subject (user ID)
    pub sub: i32,
    /// Issued at
    pub iat: i64,
    /// Expiration time
    pub exp: i64,
    /// Issuer
    pub iss: String,
    /// Audience
    pub aud: String,
    /// Token type: "access" or "refresh"
    pub token_type: String,
}

impl Claims {
    /// Create new Access Token Claims
    pub fn new_access(user_id: i32, config: &AppConfig) -> Self {
        let now = Utc::now();
        let exp = now + chrono::Duration::minutes(config.jwt.access_token_expires_minutes);
        
        Self {
            jti: uuid::Uuid::new_v4().to_string(),
            sub: user_id,
            iat: now.timestamp(),
            exp: exp.timestamp(),
            iss: "dtbox".to_string(),
            aud: "dtbox-api".to_string(),
            token_type: "access".to_string(),
        }
    }

    /// Create new Refresh Token Claims (generates JWT format refresh token)
    pub fn new_refresh(user_id: i32, config: &AppConfig) -> Self {
        let now = Utc::now();
        let exp = now + chrono::Duration::days(config.jwt.refresh_token_expires_days);
        
        Self {
            jti: uuid::Uuid::new_v4().to_string(),
            sub: user_id,
            iat: now.timestamp(),
            exp: exp.timestamp(),
            iss: "dtbox".to_string(),
            aud: "dtbox-api".to_string(),
            token_type: "refresh".to_string(),
        }
    }

    /// Encode to JWT string
    pub fn encode(&self, config: &AppConfig) -> Result<String> {
        let secret = config.jwt.secret.as_bytes();
        let token = jsonwebtoken::encode(
            &Header::default(),
            self,
            &EncodingKey::from_secret(secret),
        )?;
        Ok(token)
    }

    /// Decode JWT string
    pub fn decode(token: &str, config: &AppConfig) -> Result<Self> {
        let secret = config.jwt.secret.as_bytes();
        let mut validation = Validation::default();
        validation.set_audience(&["dtbox-api"]);
        validation.set_issuer(&["dtbox"]);
        
        let data = jsonwebtoken::decode::<Self>(
            token,
            &DecodingKey::from_secret(secret),
            &validation,
        )?;
        
        Ok(data.claims)
    }

    /// Verify if this is an access token
    pub fn verify_access(&self) -> Result<()> {
        if self.token_type != "access" {
            return Err(AppError::Auth(AuthError::TokenInvalid));
        }
        Ok(())
    }

    /// Verify if this is a refresh token
    pub fn verify_refresh(&self) -> Result<()> {
        if self.token_type != "refresh" {
            return Err(AppError::Auth(AuthError::TokenInvalid));
        }
        Ok(())
    }

    /// Get user ID
    pub fn user_id(&self) -> i32 {
        self.sub
    }

    /// Get token ID (jti)
    pub fn token_id(&self) -> &str {
        &self.jti
    }
}

/// Password hashing utility
pub struct PasswordHasher;

impl PasswordHasher {
    /// Hash password
    pub fn hash(password: &str) -> Result<String> {
        use argon2::{
            password_hash::{rand_core::OsRng, PasswordHasher as _, SaltString},
            Argon2,
        };

        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| {
                tracing::error!("Password hash error: {}", e);
                AppError::Internal
            })?;
        
        Ok(password_hash.to_string())
    }

    /// Verify password
    pub fn verify(password: &str, hash: &str) -> Result<bool> {
        use argon2::{password_hash::PasswordHash, Argon2, PasswordVerifier};

        let parsed_hash = PasswordHash::new(hash).map_err(|e| {
            tracing::error!("Password hash parse error: {}", e);
            AppError::Internal
        })?;

        let argon2 = Argon2::default();
        Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }
}

/// Refresh Token generator
pub struct RefreshTokenGenerator;

impl RefreshTokenGenerator {
    /// Generate random Refresh Token
    pub fn generate() -> String {
        uuid::Uuid::new_v4().to_string()
    }

    /// Hash Refresh Token (for storage)
    pub fn hash(token: &str) -> Result<String> {
        use argon2::{
            password_hash::{rand_core::OsRng, PasswordHasher as _, SaltString},
            Argon2,
        };

        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        
        let token_hash = argon2
            .hash_password(token.as_bytes(), &salt)
            .map_err(|e| {
                tracing::error!("Token hash error: {}", e);
                AppError::Internal
            })?;
        
        Ok(token_hash.to_string())
    }

    /// Verify Refresh Token
    pub fn verify(token: &str, hash: &str) -> Result<bool> {
        use argon2::{password_hash::PasswordHash, Argon2, PasswordVerifier};

        let parsed_hash = PasswordHash::new(hash).map_err(|e| {
            tracing::error!("Token hash parse error: {}", e);
            AppError::Internal
        })?;

        let argon2 = Argon2::default();
        Ok(argon2.verify_password(token.as_bytes(), &parsed_hash).is_ok())
    }
}

/// Token pair (returned after login)
#[derive(Debug, Clone)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub access_token_expires_at: DateTime<Utc>,
    pub refresh_token_expires_at: DateTime<Utc>,
}
