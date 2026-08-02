use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use shared::InfoResult;

#[derive(Debug, Clone, PartialEq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "u8", db_type = "Integer")]
pub enum Role {
    #[sea_orm(num_value = 1)]
    User,
    #[sea_orm(num_value = 2)]
    Subscriber,
    #[sea_orm(num_value = 5)]
    Admin,
}

impl From<u8> for Role {
    fn from(value: u8) -> Self {
        match value {
            1 => Role::User,
            2 => Role::Subscriber,
            5 => Role::Admin,
            _ => Role::User,
        }
    }
}

impl From<Role> for u8 {
    fn from(value: Role) -> u8 {
        match value {
            Role::User => 1,
            Role::Subscriber => 2,
            Role::Admin => 5,
        }
    }
}

#[derive(Clone, Debug, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
    pub avatar: String,
    pub password_hash: String,
    pub role: Role,
    pub settings: serde_json::Value,
    pub created_at: chrono::NaiveDateTime,
    pub locked_until: Option<chrono::NaiveDateTime>,
    pub failed_attempts: u8,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        has_one = "super::refresh_tokens::Entity",
        from = "Column::Id",
        to = "super::refresh_tokens::Column::UserId"
    )]
    RefreshToken,
}

impl Related<super::refresh_tokens::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RefreshToken.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

impl From<Model> for InfoResult {
    fn from(value: Model) -> Self {
        Self {
            id: value.id,
            name: value.name,
            avatar: value.avatar,
            role: value.role.into(),
            settings: value.settings,
            created_at: value.created_at,
        }
    }
}
