use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn update_stock_id_csv(
    csv_text: String,
    state: State<'_, super::AppState>,
) -> Result<(), String> {
    let mut new_map = HashMap::new();
    for line in csv_text.lines().skip(1) {
        let mut parts = line.split(',');
        if let (Some(stock_id), Some(symbol)) = (parts.next(), parts.next()) {
            new_map.insert(symbol.trim().to_string(), stock_id.trim().to_string());
        }
    }
    *state.futu_stock_id_map.lock().unwrap() = new_map;
    Ok(())
}

#[tauri::command]
pub async fn get_id_by_symbol(
    symbol: String,
    state: State<'_, super::AppState>,
) -> Result<Option<String>, String> {
    Ok(state
        .futu_stock_id_map
        .lock()
        .unwrap()
        .get(&symbol)
        .cloned())
}
