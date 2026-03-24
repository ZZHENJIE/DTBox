use crate::{
    api::API,
    database::entity::users::{self, Column},
};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Query {
    name: String,
}

impl API for Query {
    type Output = bool;

    async fn request(
        &self,
        _: Option<crate::utils::jwt::Claims>,
        state: std::sync::Arc<crate::app::State>,
    ) -> Result<Self::Output, crate::utils::error::Error> {
        let value = users::Entity::find()
            .filter(Column::Name.eq(self.name.clone()))
            .one(state.db_conn())
            .await?;
        Ok(value.is_some())
    }
}
