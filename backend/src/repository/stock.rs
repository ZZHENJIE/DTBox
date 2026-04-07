use crate::{
    database::{Database, entity::stock},
    error::{AppError, Result},
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, QuerySelect, Set};

/// Stock repository
#[derive(Debug, Clone)]
pub struct StockRepository {
    db: Database,
}

impl StockRepository {
    /// Create repository
    pub fn new(db: &Database) -> Self {
        Self { db: db.clone() }
    }

    /// Find stock by symbol
    pub async fn find_by_symbol(&self, symbol: &str) -> Result<Option<stock::Model>> {
        stock::Entity::find_by_id(symbol.to_uppercase())
            .one(self.db.conn())
            .await
            .map_err(AppError::Database)
    }

    /// Search stocks
    pub async fn search(&self, query: &str, limit: u64) -> Result<Vec<stock::Model>> {
        use sea_orm::QueryOrder;
        
        let results: Vec<stock::Model> = stock::Entity::find()
            .filter(
                stock::Column::Symbol
                    .contains(query.to_uppercase())
                    .or(stock::Column::Name.contains(query)),
            )
            .order_by_asc(stock::Column::Symbol)
            .limit(limit)
            .all(self.db.conn())
            .await
            .map_err(AppError::Database)?;
        
        Ok(results)
    }

    /// Create or update stock
    pub async fn upsert(&self, data: StockData) -> Result<stock::Model> {
        let existing = self.find_by_symbol(&data.symbol).await?;
        let now = chrono::Utc::now();

        if let Some(existing) = existing {
            // Update
            let mut active: stock::ActiveModel = existing.into();
            active.name = Set(data.name);
            active.logo_url = Set(data.logo_url);
            active.sector = Set(data.sector);
            active.industry = Set(data.industry);
            active.country = Set(data.country);
            active.market_cap = Set(data.market_cap);
            active.updated_at = Set(now.into());
            
            active.update(self.db.conn()).await.map_err(AppError::Database)
        } else {
            // Create
            let stock = stock::ActiveModel {
                symbol: Set(data.symbol.to_uppercase()),
                name: Set(data.name),
                logo_url: Set(data.logo_url),
                sector: Set(data.sector),
                industry: Set(data.industry),
                country: Set(data.country),
                market_cap: Set(data.market_cap),
                created_at: Set(now.into()),
                updated_at: Set(now.into()),
            };
            
            stock.insert(self.db.conn()).await.map_err(AppError::Database)
        }
    }
}

/// Stock data (for create/update)
pub struct StockData {
    pub symbol: String,
    pub name: String,
    pub logo_url: Option<String>,
    pub sector: Option<String>,
    pub industry: Option<String>,
    pub country: Option<String>,
    pub market_cap: Option<f64>,
}
