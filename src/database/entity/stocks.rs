use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "stocks")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub symbol: String,
    pub company: String,
    pub sector: String,
    pub industry: String,
    pub country: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
