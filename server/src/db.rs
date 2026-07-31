use sea_orm::{ConnectionTrait, DatabaseConnection, Schema};

use crate::entity::{refresh_tokens, stocks, users};

pub async fn init_database(db: &DatabaseConnection) -> Result<(), sea_orm::DbErr> {
    let schema = Schema::new(db.get_database_backend());

    let mut stmt = schema.create_table_from_entity(users::Entity);
    stmt.if_not_exists();
    db.execute(&stmt).await?;

    let mut stmt = schema.create_table_from_entity(refresh_tokens::Entity);
    stmt.if_not_exists();
    db.execute(&stmt).await?;

    let mut stmt = schema.create_table_from_entity(stocks::Entity);
    stmt.if_not_exists();
    db.execute(&stmt).await?;

    Ok(())
}
