mod api;
mod auth;
mod state;
mod vault;

use std::sync::Arc;

use state::AppState;
use tauri::{Emitter, Manager};
use tauri_plugin_opener::OpenerExt;

#[derive(Clone, serde::Serialize)]
struct UserInfo {
    user_id: Option<String>,
    username: Option<String>,
    avatar: Option<String>,
}

fn current_user_info(state: &Arc<AppState>) -> UserInfo {
    UserInfo {
        user_id: state.user_id.read().unwrap().map(|id| id.to_string()),
        username: vault::load_last_username(),
        avatar: None,
    }
}

fn emit_auth_state(app: &tauri::AppHandle, state: &Arc<AppState>) {
    let _ = app.emit("auth-state", current_user_info(state));
}

#[tauri::command]
async fn do_login(
    app: tauri::AppHandle,
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

    emit_auth_state(&app, &state);

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
async fn do_logout(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
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

    emit_auth_state(&app, &state);

    Ok(())
}

#[tauri::command]
async fn get_access_token(state: tauri::State<'_, Arc<AppState>>) -> Result<String, String> {
    state
        .access_token
        .read()
        .unwrap()
        .clone()
        .ok_or_else(|| "not logged in".to_string())
}

#[tauri::command]
async fn refresh_access_token(state: tauri::State<'_, Arc<AppState>>) -> Result<String, String> {
    let server_url = state.server_url.read().unwrap().clone();
    let user_id = *state.user_id.read().unwrap();
    let uid = user_id.ok_or_else(|| "no user id".to_string())?;

    let refresh_token = vault::load(uid).map_err(|_| "failed to load refresh token".to_string())?;
    let new_token = auth::refresh(&server_url, &refresh_token).await?;
    *state.access_token.write().unwrap() = Some(new_token.clone());

    Ok(new_token)
}

#[tauri::command]
async fn get_user_id(state: tauri::State<'_, Arc<AppState>>) -> Result<String, String> {
    state
        .user_id
        .read()
        .unwrap()
        .map(|id| id.to_string())
        .ok_or_else(|| "not logged in".to_string())
}

#[tauri::command]
async fn get_user_info(state: tauri::State<'_, Arc<AppState>>) -> Result<UserInfo, String> {
    let user_id = state.user_id.read().unwrap().map(|id| id.to_string());
    let username = vault::load_last_username();

    let mut avatar = None;
    let mut server_name = None;
    if state.access_token.read().unwrap().is_some() {
        if let Ok(info) = api::get_with_auth::<shared::InfoResult>(&state, "/api/user/me").await {
            if !info.avatar.is_empty() {
                avatar = Some(info.avatar);
            }
            server_name = Some(info.name);
        }
    }

    Ok(UserInfo {
        user_id,
        username: server_name.or(username),
        avatar,
    })
}

#[tauri::command]
async fn set_server_url(state: tauri::State<'_, Arc<AppState>>, url: String) -> Result<(), String> {
    *state.server_url.write().unwrap() = url;
    Ok(())
}

#[tauri::command]
async fn get_server_url(state: tauri::State<'_, Arc<AppState>>) -> Result<String, String> {
    Ok(state.server_url.read().unwrap().clone())
}

#[tauri::command]
async fn test_connection(
    state: tauri::State<'_, Arc<AppState>>,
    url: Option<String>,
) -> Result<String, String> {
    let target = match url {
        Some(u) if !u.trim().is_empty() => u,
        _ => state.server_url.read().unwrap().clone(),
    };

    if target.is_empty() {
        return Err("server url not configured".to_string());
    }

    auth::health(&target).await
}

#[tauri::command]
async fn open_web(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let server_url = state.server_url.read().unwrap().clone();
    if server_url.is_empty() {
        return Err("server url not configured".to_string());
    }

    if let Some(window) = app.get_webview_window("web") {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    let url: tauri::Url = server_url
        .parse()
        .map_err(|e| format!("invalid server url: {e}"))?;

    tauri::WebviewWindowBuilder::new(&app, "web", tauri::WebviewUrl::External(url))
        .title("DTBox")
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn open_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn open_time_window(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let server_url = state.server_url.read().unwrap().clone();
    if server_url.is_empty() {
        return Err("server url not configured".to_string());
    }

    if let Some(window) = app.get_webview_window("time_window") {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    let url: tauri::Url = format!("{}/tools/timewindow", server_url.trim_end_matches('/'))
        .parse()
        .map_err(|e| format!("invalid url: {e}"))?;

    tauri::WebviewWindowBuilder::new(&app, "time_window", tauri::WebviewUrl::External(url))
        .always_on_top(true)
        .title("TimeWindow")
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn auto_login(state: tauri::State<'_, Arc<AppState>>) -> Result<bool, String> {
    let server_url = state.server_url.read().unwrap().clone();
    if server_url.is_empty() {
        return Ok(false);
    }

    let Some(user_id) = vault::load_last_user_id() else {
        return Ok(false);
    };

    let refresh_token = match vault::load(user_id) {
        Ok(token) => token,
        Err(_) => return Ok(false),
    };

    match auth::refresh(&server_url, &refresh_token).await {
        Ok(new_token) => {
            *state.access_token.write().unwrap() = Some(new_token);
            *state.user_id.write().unwrap() = Some(user_id);
            Ok(true)
        }
        Err(_) => Ok(false),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            do_login,
            do_register,
            do_logout,
            get_access_token,
            refresh_access_token,
            get_user_id,
            get_user_info,
            set_server_url,
            get_server_url,
            test_connection,
            open_web,
            open_url,
            open_time_window,
            auto_login,
        ]);

    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
