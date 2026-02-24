pub mod jwt;
pub mod log;
pub mod settings;

pub use settings::SETTINGS;

use argon2::{
    Argon2,
    password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
};

pub fn hash(value: &[u8]) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    match argon2.hash_password(value, &salt) {
        Ok(hash) => Ok(hash.to_string()),
        Err(e) => Err(e.to_string()),
    }
}
