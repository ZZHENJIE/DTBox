use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // init settings and server config
    let settings = dtbox_lib::Settings::new("./settings.toml")?;
    let server_config = &settings.server;
    let server = format!("{}:{}", server_config.host, server_config.port);
    // create state and router
    let state = Arc::new(dtbox_lib::AppState::new(settings).await?);
    let app = dtbox_lib::app::router::new(Arc::clone(&state)).with_state(state);
    // verify listener and start server
    let listener = tokio::net::TcpListener::bind(server).await?;
    println!("Server created successfully.");
    axum::serve(listener, app).await.unwrap_or_else(|err| {
        eprintln!("Axum server error: {}.", err);
    });
    Ok(())
}
