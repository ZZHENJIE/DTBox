use crate::{Api, AppState, source::screener::finviz::ScreenerFinviz};
use anyhow::anyhow;
use std::sync::Arc;

pub async fn update_stocks_table(state: Arc<AppState>) -> Result<(), anyhow::Error> {
    let screener = ScreenerFinviz::default();
    let pool = state.database_pool();
    match screener.fetch(Arc::clone(&state)).await {
        Ok(array) => {
            sqlx::query!("DELETE FROM sqlite_sequence WHERE name='stocks'")
                .execute(pool)
                .await?;
            sqlx::query!("DELETE FROM stocks").execute(pool).await?;
            for item in array {
                sqlx::query!(
                    r#"
                    INSERT INTO stocks (symbol, company, sector, industry, country)
                    VALUES (?1, ?2, ?3, ?4, ?5)
                    "#,
                    item.symbol,
                    item.company,
                    item.sector,
                    item.industry,
                    item.country
                )
                .execute(pool)
                .await?;
            }
        }
        Err(_) => return Err(anyhow!("Update Stocks Table Error")),
    }
    Ok(())
}
