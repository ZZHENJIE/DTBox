/// Database module
pub mod entity;

use sea_orm::{ConnectionTrait, DatabaseConnection};
use std::sync::Arc;

/// Database connection manager
#[derive(Debug, Clone)]
pub struct Database {
    conn: Arc<DatabaseConnection>,
}

impl Database {
    /// Establish database connection
    pub async fn connect(database_url: &str, max_connections: u32) -> anyhow::Result<Self> {
        use sea_orm::ConnectOptions;
        
        // Handle SQLite file path
        let db_url = if database_url.starts_with("sqlite://") {
            let path_str = database_url.trim_start_matches("sqlite://");
            
            // If memory database, use directly
            if path_str == ":memory:" || path_str.contains("mode=memory") {
                database_url.to_string()
            } else {
                // File-based database - ensure absolute path
                let path_str = path_str.trim_start_matches("./");
                let path = if path_str.starts_with('/') {
                    std::path::PathBuf::from(path_str)
                } else {
                    // Relative path, convert to absolute
                    std::env::current_dir()?.join(path_str)
                };
                
                // Ensure parent directory exists
                if let Some(parent) = path.parent() {
                    if !parent.exists() {
                        std::fs::create_dir_all(parent)?;
                        tracing::info!("Created database directory: {}", parent.display());
                    }
                }
                
                // Sea-ORM/sqlx requires database file to exist, create empty file first
                if !path.exists() {
                    std::fs::File::create(&path)?;
                    tracing::info!("Created database file: {}", path.display());
                }
                
                // SQLite URL format: sqlite:/absolute/path/to/file.db
                let url = format!("sqlite:{}", path.display());
                tracing::info!("Using database URL: {}", url);
                url
            }
        } else {
            database_url.to_string()
        };
        
        let mut opt = ConnectOptions::new(db_url);
        opt.max_connections(max_connections)
            .min_connections(1)
            .connect_timeout(std::time::Duration::from_secs(8))
            .idle_timeout(std::time::Duration::from_secs(8))
            .max_lifetime(std::time::Duration::from_secs(8));

        let conn = sea_orm::Database::connect(opt).await?;
        
        tracing::info!("Database connected successfully");
        
        Ok(Self {
            conn: Arc::new(conn),
        })
    }

    /// Get database connection
    pub fn conn(&self) -> &DatabaseConnection {
        &self.conn
    }

    /// Run migrations (auto-create tables) - use raw SQL to avoid AUTOINCREMENT issues
    pub async fn migrate(&self) -> anyhow::Result<()> {
        // Create users table
        let sql = r#"
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                pass_hash TEXT NOT NULL,
                config TEXT NOT NULL DEFAULT '{}',
                permissions INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        "#;
        self.conn.execute_unprepared(sql).await?;

        // Create refresh_tokens table
        let sql = r#"
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL,
                token_id TEXT NOT NULL UNIQUE,
                revoked INTEGER NOT NULL DEFAULT 0,
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_used_at DATETIME,
                use_count INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        "#;
        self.conn.execute_unprepared(sql).await?;

        // Create stocks table
        let sql = r#"
            CREATE TABLE IF NOT EXISTS stocks (
                symbol TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                logo_url TEXT,
                sector TEXT,
                industry TEXT,
                country TEXT,
                market_cap REAL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        "#;
        self.conn.execute_unprepared(sql).await?;

        tracing::info!("Database migration completed");
        Ok(())
    }
}
