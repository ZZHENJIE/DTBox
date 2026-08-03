use crate::entity::stocks::{self, Column};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter};
use shared::{StockItem, StockSearchResult};

pub async fn search_stocks(
    db: &DatabaseConnection,
    symbol: &str,
    page: u64,
    limit: u64,
) -> Result<StockSearchResult, Box<dyn std::error::Error>> {
    let limit = limit.min(100);
    let sym = symbol.trim().to_uppercase();

    let paginator = stocks::Entity::find()
        .filter(Column::Symbol.starts_with(&sym))
        .paginate(db, limit);

    let total = paginator.num_items().await?;
    let stocks_data = paginator.fetch_page(page.saturating_sub(1)).await?;

    let stocks: Vec<StockItem> = stocks_data
        .into_iter()
        .map(|s| StockItem {
            id: s.id,
            symbol: s.symbol,
            name: s.name,
        })
        .collect();

    Ok(StockSearchResult {
        stocks,
        total,
        page,
        limit,
    })
}