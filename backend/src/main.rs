use axum::Router;
use dtbox::{api::create_api_routes, config::AppConfig, logger::init_logging, state::AppState};
use std::sync::Arc;
use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load configuration
    let config = AppConfig::load()?;

    // Initialize logging
    let _log_guard = init_logging(&config.log.directory, &config.log.level)?;

    tracing::info!("Starting DTBox server v{}", env!("CARGO_PKG_VERSION"));

    // Create application state
    let state = Arc::new(AppState::new(config.clone()).await?);

    // Create API routes
    let api_routes = create_api_routes(state.clone());

    // Static file service
    let web_path = config.web.path.clone();
    let static_service =
        ServeDir::new(&web_path).fallback(ServeFile::new(web_path.join("index.html")));

    // Merge routes
    let app = Router::new()
        .nest("/api", api_routes)
        .fallback_service(static_service);

    // Bind address
    let addr = format!("{}:{}", config.server.host, config.server.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tracing::info!("Server listening on http://{}", addr);

    // Start server
    axum::serve(listener, app).await?;

    Ok(())
}
