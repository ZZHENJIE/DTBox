use crate::{Api, AppState, source::screener::finviz::ScreenerFinviz};
use anyhow::anyhow;
use std::sync::Arc;

pub async fn update_stocks_table(state: Arc<AppState>) -> Result<(), anyhow::Error> {
    let screener = ScreenerFinviz::default();
    let pool = state.database_pool();
    match screener.fetch(Arc::clone(&state)).await {
        Ok(array) => {
            sqlx::query!("DROP TABLE IF EXISTS stocks")
                .execute(pool)
                .await?;
            sqlx::query!(
                "CREATE TABLE IF NOT EXISTS stocks (
                            id          INTEGER PRIMARY KEY AUTOINCREMENT,
                            symbol      TEXT NOT NULL UNIQUE,
                            company     TEXT NOT NULL,
                            sector      TEXT NOT NULL,
                            industry    TEXT NOT NULL,
                            country     TEXT NOT NULL
                        );"
            )
            .execute(pool)
            .await?;
            let mut tx = pool.begin().await?;
            for item in array {
                sqlx::query(
                    r#"INSERT INTO stocks (symbol, company, sector, industry, country)
                       VALUES (?1, ?2, ?3, ?4, ?5)"#,
                )
                .bind(&item.symbol)
                .bind(&item.company)
                .bind(&item.sector)
                .bind(&item.industry)
                .bind(&item.country)
                .execute(&mut *tx)
                .await?;
            }
            tx.commit().await?;
        }
        Err(_) => return Err(anyhow!("Update Stocks Table Error")),
    }

    Ok(())
}
