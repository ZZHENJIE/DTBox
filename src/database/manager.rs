use sqlx::{Pool, Sqlite, migrate::MigrateDatabase};

pub async fn open_database(path: &str) -> Result<Pool<Sqlite>, anyhow::Error> {
    // promise to create directory if not exists
    if let Some(parent) = std::path::Path::new(path).parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    // promise to create database if not exists
    let mut is_exists = true;
    if !sqlx::Sqlite::database_exists(&path).await? {
        is_exists = false;
        sqlx::Sqlite::create_database(&path).await?;
    }
    // connect to database
    let pool = sqlx::SqlitePool::connect(path).await?;
    // first connection init database
    if !is_exists {
        init_database(&pool).await?;
    }
    Ok(pool)
}

async fn init_database(pool: &Pool<Sqlite>) -> Result<(), anyhow::Error> {
    sqlx::query(
        r#"
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    pass_hash   TEXT    NOT NULL,
    config      TEXT    NOT NULL DEFAULT '{}',
    follow      TEXT    DEFAULT '[]',
    permissions INTEGER NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_token (
    user_id     INTEGER PRIMARY KEY,
    token_hash  TEXT NOT NULL,
    issued_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at  DATETIME NOT NULL,
    revoked     INTEGER DEFAULT 0,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
        "#,
    )
    .execute(pool)
    .await?;
    Ok(())
}
