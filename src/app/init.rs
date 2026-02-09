use crate::{api, app, utils::settings};
use axum::Router;
use std::{path::PathBuf, sync::Arc};
use tower_http::services::{ServeDir, ServeFile};

pub async fn start(state: &app::State) -> anyhow::Result<Router<Arc<app::State>>> {
    let result = router(&state.settings().web);
    Ok(result)
}

fn router(settings: &settings::Web) -> Router<Arc<app::State>> {
    let web_path = PathBuf::from(&settings.path);
    let service = ServeDir::new(&web_path).fallback(ServeFile::new(web_path.join("index.html")));
    let router = axum::Router::new().fallback_service(service);
    api::register::result(router)
}
