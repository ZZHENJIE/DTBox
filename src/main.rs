use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // init settings and server config
    let settings = dtbox_lib::Settings::new("./settings.toml")?;
    let server_config = &settings.server;
    let server = format!("{}:{}", server_config.host, server_config.port);
    // create state
    let state = Arc::new(dtbox_lib::AppState::new(settings).await?);
    // init and create router
    let _ = init(Arc::clone(&state)).await?;
    let app = dtbox_lib::app::router::new(Arc::clone(&state)).with_state(state);
    // verify listener and start server
    let listener = tokio::net::TcpListener::bind(server).await?;
    println!("Created server successfully.");
    axum::serve(listener, app).await.unwrap_or_else(|err| {
        eprintln!("Running server error: {}.", err);
    });
    Ok(())
}

async fn init(state: Arc<dtbox_lib::AppState>) -> anyhow::Result<()> {
    dtbox_lib::app::init::update_stocks_table(Arc::clone(&state)).await?;
    Ok(())
}
