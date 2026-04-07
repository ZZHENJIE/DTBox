use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Refresh Token entity
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "refresh_tokens")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    
    /// Associated user ID
    pub user_id: i32,
    
    /// Token hash (store hash, not plaintext)
    #[sea_orm(column_name = "token_hash")]
    pub token_hash: String,
    
    /// Token ID (jti)
    pub token_id: String,
    
    /// Whether revoked
    #[sea_orm(default_value = "false")]
    pub revoked: bool,
    
    /// Expiration time
    pub expires_at: DateTimeWithTimeZone,
    
    /// Creation time
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub created_at: DateTimeWithTimeZone,
    
    /// Last used time
    pub last_used_at: Option<DateTimeWithTimeZone>,
    
    /// Usage count
    #[sea_orm(default_value = "0")]
    pub use_count: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id"
    )]
    User,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
