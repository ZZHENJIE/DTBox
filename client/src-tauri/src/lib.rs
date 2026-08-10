mod api;
mod auth;
mod economics;
mod state;
mod tool;
mod vault;
mod ws_server;

use std::sync::Arc;

use state::AppState;

#[tauri::command]
async fn do_login(
    state: tauri::State<'_, Arc<AppState>>,
    name: String,
    password: String,
) -> Result<String, String> {
    let server_url = state.server_url.read().unwrap().clone();
    let result = auth::login(&server_url, &name, &password).await?;

    vault::store(result.user_id, &result.refresh_token)
        .map_err(|e| format!("keyring store error: {}", e))?;
    let _ = vault::store_last_user_id(result.user_id);
    let _ = vault::store_last_username(&name);

    *state.access_token.write().unwrap() = Some(result.access_token);
    *state.user_id.write().unwrap() = Some(result.user_id);

    Ok(format!("{}", result.user_id))
}

#[tauri::command]
async fn do_register(
    state: tauri::State<'_, Arc<AppState>>,
    name: String,
    password: String,
) -> Result<String, String> {
    let server_url = state.server_url.read().unwrap().clone();
    let result = auth::register(&server_url, &name, &password).await?;
    Ok(format!("{}", result.user_id))
}

#[tauri::command]
async fn do_logout(state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    let server_url = state.server_url.read().unwrap().clone();
    let access_token = state.access_token.read().unwrap().clone();
    let user_id = *state.user_id.read().unwrap();

    if let Some(token) = access_token {
        if let Some(uid) = user_id {
            let _ = auth::logout(&server_url, &token).await;
            let _ = vault::delete(uid);
        }
    }

    *state.access_token.write().unwrap() = None;
    *state.user_id.write().unwrap() = None;
    let _ = vault::clear_last_user_id();
    let _ = vault::clear_last_username();

    Ok(())
}

#[tauri::command]
async fn try_auto_login(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(String, u16, String), String> {
    let server_url = state.server_url.read().unwrap().clone();
    let user_id = vault::load_last_user_id()
        .ok_or_else(|| "no stored session".to_string())?;

    let refresh_token = vault::load(user_id)
        .map_err(|_| "keyring load error".to_string())?;

    let access_token = auth::refresh(&server_url, &refresh_token)
        .await
        .map_err(|e| format!("refresh failed: {}", e))?;

    *state.access_token.write().unwrap() = Some(access_token);
    *state.user_id.write().unwrap() = Some(user_id);

    let port = ws_server::start(state.inner().clone()).await?;
    let username = vault::load_last_username().unwrap_or_default();

    Ok((format!("{}", user_id), port, username))
}

#[tauri::command]
async fn start_ws_server(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<u16, String> {
    ws_server::start(state.inner().clone()).await
}

#[tauri::command]
async fn open_web_page(
    web_url: String,
    ws_port: u16,
) -> Result<(), String> {
    let url = format!("{}/open?ws_port={}", web_url, ws_port);
    tauri_plugin_opener::open_url(url, None::<&str>)
        .map_err(|e| format!("open error: {}", e))
}

#[tauri::command]
async fn set_server_url(
    state: tauri::State<'_, Arc<AppState>>,
    url: String,
) -> Result<(), String> {
    *state.server_url.write().unwrap() = url;
    Ok(())
}

#[tauri::command]
async fn get_server_url(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<String, String> {
    Ok(state.server_url.read().unwrap().clone())
}

#[tauri::command]
async fn open_time_tool(
    app: tauri::AppHandle,
) -> Result<(), String> {
    tauri::WebviewWindowBuilder::new(
        &app,
        "time-tool",
        tauri::WebviewUrl::App("time-tool.html".into()),
    )
    .title("Time Tool")
    .inner_size(400.0, 500.0)
    .always_on_top(true)
    .build()
    .map_err(|e| format!("{}", e))?;

    Ok(())
}

#[tauri::command]
async fn fetch_akamai_timestamp(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<u64, String> {
    tool::fetch_timestamp(state.inner()).await
}

#[tauri::command]
async fn fetch_usa_economics(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<Vec<economics::EconomicsItem>, String> {
    economics::fetch_usa_economics(state.inner()).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            do_login,
            do_register,
            do_logout,
            try_auto_login,
            start_ws_server,
            open_web_page,
            set_server_url,
            get_server_url,
            open_time_tool,
            fetch_akamai_timestamp,
            fetch_usa_economics,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
