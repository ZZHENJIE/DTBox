use crate::{api, app, utils::SETTINGS};
use axum::Router;
use std::{path::PathBuf, sync::Arc};
use tower_http::services::{ServeDir, ServeFile};

pub async fn start(_: &app::State) -> anyhow::Result<Router<Arc<app::State>>> {
    let result = router();
    Ok(result)
}

fn router() -> Router<Arc<app::State>> {
    let web_path = PathBuf::from(&SETTINGS.web.path);
    let service = ServeDir::new(&web_path).fallback(ServeFile::new(web_path.join("index.html")));
    let router = axum::Router::new().fallback_service(service);
    api::register::result(router)
}
