use dtbox::{
    app, database,
    utils::{Settings, log},
};
use std::sync::Arc;
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize log system
    let _guard = log::log_system_init()?;
    info!("Log System Initialize Success.");

    // Load settings
    let settings = Settings::new("./settings.json").await?;
    info!("Settings Load Success.");

    // Connect to database
    let db_conn = database::connect(&settings.database).await?;
    info!("Database Connection Success.");

    // Initialize database
    let _ = database::setup_schema(&db_conn).await?;
    info!("Database Initialize Success.");

    // Create app state
    let address = format!("{}:{}", settings.server.host, settings.server.port);
    let app_state = Arc::new(app::State::new(db_conn, settings));

    // Initialize app
    let router = app::start_app_init(&app_state).await?;
    info!("App Initialization Success.");
    let app = router.with_state(app_state);

    // Bind listener
    let listener = tokio::net::TcpListener::bind(&address).await?;
    info!("Listener Bind Success.");

    // Start server
    info!("Server Starting On {}.", address);
    axum::serve(listener, app).await?;

    Ok(())
}
