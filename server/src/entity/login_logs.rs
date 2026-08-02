use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "login_logs")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub user_id: i32,
    pub ip: String,
    pub success: bool,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
