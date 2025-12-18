use crate::{Api, Error};
use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::{Argon2, PasswordHasher};
use serde::Deserialize;

fn hash_password(password: &[u8]) -> Result<String, argon2::password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    match argon2.hash_password(password, &salt) {
        Ok(hash) => Ok(hash.to_string()),
        Err(e) => Err(e),
    }
}

#[derive(Debug, Deserialize)]
pub struct Register {
    pub name: String,
    pub password: String,
}

impl Api for Register {
    type Output = bool;
    type Error = Error;

    async fn fetch(
        &self,
        state: std::sync::Arc<crate::AppState>,
    ) -> Result<Self::Output, Self::Error> {
        let pass_hash =
            hash_password(self.password.as_bytes()).map_err(|e| Error::Internal(e.to_string()))?;

        let _ = sqlx::query!(
            r#"
            INSERT INTO users (name, pass_hash)
            VALUES ($1, $2)
            RETURNING id
            "#,
            self.name,
            pass_hash
        )
        .fetch_one(state.database_pool())
        .await?;

        Ok(true)
    }
}
