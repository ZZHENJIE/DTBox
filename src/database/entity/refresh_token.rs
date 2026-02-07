use crate::database::entity::users;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "refresh_token")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub user_id: i64,
    pub token_hash: String,
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub issued_at: DateTimeWithTimeZone,
    pub expires_at: DateTimeWithTimeZone,
    #[sea_orm(default_value = "0")]
    pub revoked: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id"
    )]
    User,
}

impl ActiveModelBehavior for ActiveModel {}

impl Related<users::Entity> for Entity {
    fn to() -> sea_orm::RelationDef {
        Relation::User.def()
    }
}
