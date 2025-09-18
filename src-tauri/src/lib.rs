use std::{collections::HashMap, sync::Mutex};

mod futu;

struct AppState {
    futu_stock_id_map: Mutex<HashMap<String, String>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .manage(AppState {
            futu_stock_id_map: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            futu::update_stock_id_csv,
            futu::get_id_by_symbol
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
