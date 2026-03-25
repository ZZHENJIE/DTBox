pub mod error;
pub mod jwt;
pub mod log;
pub mod settings;
pub mod translate;

pub use settings::SETTINGS;

use argon2::{
    Argon2,
    password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
};

use crate::Error;

pub fn hash(value: &[u8]) -> Result<String, Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    match argon2.hash_password(value, &salt) {
        Ok(hash) => Ok(hash.to_string()),
        Err(e) => Err(e.into()),
    }
}

pub fn normalize_ws(s: String) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}
