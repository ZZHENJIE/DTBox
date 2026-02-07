pub mod entity;
use crate::utils::settings::Database as DBSettings;
use sea_orm::{ConnectionTrait, Database, DatabaseConnection, DbBackend, Schema};

pub async fn connect(settings: &DBSettings) -> anyhow::Result<DatabaseConnection> {
    if let Some(parent) = std::path::Path::new(&settings.path).parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    let connection_string = format!("sqlite://{}?mode=rwc", settings.path);
    let db = Database::connect(connection_string).await?;
    Ok(db)
}

pub async fn setup_schema(db: &DatabaseConnection) -> anyhow::Result<()> {
    let schema = Schema::new(DbBackend::Sqlite);

    let mut statements = Vec::new();
    statements.push(
        schema
            .create_table_from_entity(entity::UsersEntity)
            .if_not_exists()
            .to_owned(),
    );
    statements.push(
        schema
            .create_table_from_entity(entity::RefreshTokenEntity)
            .if_not_exists()
            .to_owned(),
    );
    statements.push(
        schema
            .create_table_from_entity(entity::StocksEntity)
            .if_not_exists()
            .to_owned(),
    );

    for stmt in statements {
        db.execute(db.get_database_backend().build(&stmt)).await?;
    }

    Ok(())
}
