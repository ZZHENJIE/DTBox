use argon2::PasswordVerifier;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

use crate::{
    api::{API, Response},
    database::entity::users::{self, Column},
};

#[derive(Deserialize)]
pub struct LoginPayload {
    pub name: String,
    pub password: String,
}

impl API for LoginPayload {
    type Output = bool;
    async fn request(
        &self,
        state: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        let user = match users::Entity::find()
            .filter(Column::Name.eq(self.name.clone()))
            .one(state.db_conn())
            .await
        {
            Ok(value) => {
                if let Some(value) = value {
                    value
                } else {
                    return Response::error(format!("User {} not found.", self.name));
                }
            }
            Err(err) => return Response::error(err.to_string()),
        };

        let parsed_hash = match argon2::password_hash::PasswordHash::new(&user.pass_hash) {
            Ok(value) => value,
            Err(err) => return Response::error(err.to_string()),
        };

        let is_ok = argon2::Argon2::default()
            .verify_password(self.password.as_bytes(), &parsed_hash)
            .is_ok();

        Response::success_with_data(is_ok)
    }
}
