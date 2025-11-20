use std::sync::Arc;

use axum::{
    Router,
    routing::{get, get_service},
};

use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let settings = dtbox_lib::Settings::new("./settings.toml")?;
    let static_dir = settings.server.static_dir.clone();
    let server_host_port = format!("0.0.0.0:{}", settings.server.port);
    let state = dtbox_lib::AppState::new(settings).await?;
    let app = Router::new()
        .nest_service(
            "/static",
            get_service(
                ServeDir::new(&static_dir)
                    .not_found_service(ServeFile::new(format!("{}/index.html", static_dir)))
                    .fallback(ServeFile::new(format!("{}/index.html", static_dir))),
            ),
        )
        .route("/api/test1", get(async || "Hello Test1"))
        .with_state(Arc::new(state));
    let listener = tokio::net::TcpListener::bind(&server_host_port).await?;
    println!("Server started {}", server_host_port);
    axum::serve(listener, app).await?;
    Ok(())
}
