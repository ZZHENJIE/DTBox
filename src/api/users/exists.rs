use crate::{
    api::{API, Response},
    database::entity::users::{self, Column},
};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct ExistsQuery {
    name: String,
}

impl API for ExistsQuery {
    type Output = bool;
    async fn request(
        &self,
        state: std::sync::Arc<crate::app::State>,
    ) -> crate::api::Response<Self::Output> {
        match users::Entity::find()
            .filter(Column::Name.eq(self.name.clone()))
            .one(state.db_conn())
            .await
        {
            Ok(value) => Response::success_with_data(value.is_some()),
            Err(err) => Response::error(err.to_string()),
        }
    }
}
