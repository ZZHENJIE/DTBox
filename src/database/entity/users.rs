use crate::database::entity::refresh_token;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    #[sea_orm(unique)]
    pub name: String,
    pub pass_hash: String,
    pub config: serde_json::Value,
    pub follow: serde_json::Value,
    #[sea_orm(default_value = "0")]
    pub permissions: i32,
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub create_time: DateTimeWithTimeZone,
}

impl Model {
    pub fn follow(&self) -> Result<Vec<String>, serde_json::Error> {
        serde_json::from_value::<Vec<String>>(self.follow.clone())
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::refresh_token::Entity")]
    RefreshToken,
}

impl ActiveModelBehavior for ActiveModel {}

impl Related<refresh_token::Entity> for Entity {
    fn to() -> sea_orm::RelationDef {
        Relation::RefreshToken.def()
    }
}
