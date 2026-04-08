use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// User entity
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,

    #[sea_orm(unique, indexed)]
    pub username: String,

    #[sea_orm(column_name = "pass_hash")]
    pub password_hash: String,

    #[sea_orm(column_type = "Json")]
    pub settings: Json,

    #[sea_orm(default_value = "0")]
    pub permissions: i32,

    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub created_at: DateTimeWithTimeZone,

    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::refresh_token::Entity")]
    RefreshTokens,
}

impl Related<super::refresh_token::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RefreshTokens.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

/// User permission levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum UserPermission {
    /// Regular user
    User = 0,
    /// Premium user
    Premium = 1,
    /// Administrator
    Admin = 5,
}

impl UserPermission {
    pub fn from_i32(value: i32) -> Self {
        match value {
            5 => Self::Admin,
            1 => Self::Premium,
            _ => Self::User,
        }
    }

    pub fn to_i32(self) -> i32 {
        self as i32
    }

    pub fn is_admin(self) -> bool {
        self == Self::Admin
    }

    pub fn is_premium(self) -> bool {
        self == Self::Premium || self == Self::Admin
    }
}
