use crate::{api, app, utils::SETTINGS};
use axum::Router;
use std::{path::PathBuf, sync::Arc};
use tower_http::services::{ServeDir, ServeFile};

pub async fn start(_: &app::State) -> anyhow::Result<Router<Arc<app::State>>> {
    let web_path = PathBuf::from(&SETTINGS.web.path);
    let service = ServeDir::new(&web_path).fallback(ServeFile::new(web_path.join("index.html")));
    Ok(register_router(service))
}

pub fn register_router(service: ServeDir<ServeFile>) -> Router<Arc<app::State>> {
    Router::new()
        .merge(api::register()) // 工具接口
        .merge(api::users::register()) // 用户相关接口
        .fallback_service(service)
}
