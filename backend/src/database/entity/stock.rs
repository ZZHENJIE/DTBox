use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Stock entity
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "stocks")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub symbol: String,
    
    pub name: String,
    
    #[sea_orm(nullable)]
    pub logo_url: Option<String>,
    
    #[sea_orm(nullable)]
    pub sector: Option<String>,
    
    #[sea_orm(nullable)]
    pub industry: Option<String>,
    
    #[sea_orm(nullable)]
    pub country: Option<String>,
    
    /// Market cap (in millions USD)
    #[sea_orm(nullable)]
    pub market_cap: Option<f64>,
    
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub created_at: DateTimeWithTimeZone,
    
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        panic!("No relations defined")
    }
}

impl ActiveModelBehavior for ActiveModel {}
