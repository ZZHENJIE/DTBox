use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // init settings and server config
    let settings = dtbox_lib::Settings::new("./settings.toml")?;
    let server_host_port = format!("0.0.0.0:{}", settings.server.port);
    // create state and router
    let app = dtbox_lib::Router::new(&settings);
    let state = Arc::new(dtbox_lib::AppState::new(settings).await?);
    let mut background_tasks = dtbox_lib::AppState::init_background_task(Arc::clone(&state));
    let app = app.with_state(Arc::clone(&state));
    // verify listener and start server
    let listener = tokio::net::TcpListener::bind(&server_host_port).await?;
    println!(
        "Server created successfully.\nListener http://{}/static 🎉",
        server_host_port
    );
    background_tasks.push(tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap_or_else(|err| {
            eprintln!("Axum server error: {}", err);
        });
    }));

    futures::future::join_all(background_tasks).await;
    Ok(())
}
