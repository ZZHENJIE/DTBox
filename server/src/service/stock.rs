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
            logo: s.logo.as_ref().map(|bytes| {
                use base64::Engine;
                format!("data:image/png;base64,{}", base64::engine::general_purpose::STANDARD.encode(bytes))
            }),
        })
        .collect();

    Ok(StockSearchResult {
        stocks,
        total,
        page,
        limit,
    })
}