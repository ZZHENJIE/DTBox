use crate::{Api, Error};
use argon2::PasswordVerifier;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Signin {
    pub name: String,
    pub password: String,
}

impl Api for Signin {
    type Output = bool;
    type Error = Error;

    async fn fetch(
        &self,
        state: std::sync::Arc<crate::AppState>,
    ) -> Result<Self::Output, Self::Error> {
        let user = match super::operation::find_for_name(&self.name, state.database_pool()).await? {
            Some(user) => user,
            None => return Err(Error::AuthError("User does not exist!".to_string())),
        };
        let parsed_hash = argon2::password_hash::PasswordHash::new(&user.pass_hash)?;
        let is_ok = argon2::Argon2::default()
            .verify_password(self.password.as_bytes(), &parsed_hash)
            .is_ok();
        Ok(is_ok)
    }
}
