use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // init settings and server config
    let settings = dtbox_lib::Settings::new("./settings.toml")?;
    let server_host_port = format!("0.0.0.0:{}", settings.server.port);
    // create state and router
    let state = Arc::new(dtbox_lib::AppState::new(settings).await?);
    let app = dtbox_lib::Router::new(state.settings()).with_state(Arc::clone(&state));
    // verify listener and start server
    let listener = tokio::net::TcpListener::bind(&server_host_port).await?;
    println!(
        "Server created successfully.\nListener http://{}/static 🎉",
        server_host_port
    );
    axum::serve(listener, app).await.unwrap_or_else(|err| {
        eprintln!("Axum server error: {}", err);
    });
    Ok(())
}
