use crate::AppState;
use crate::database;
use axum::routing::{get_service, post};
use std::sync::Arc;
use tower_http::services::{ServeDir, ServeFile};

pub struct Router;

impl Router {
    pub fn new(settings: &crate::Settings) -> axum::Router<Arc<AppState>> {
        let app = axum::Router::new()
            .nest_service(
                "/static",
                get_service(
                    ServeDir::new(settings.server.static_dir.clone())
                        .not_found_service(ServeFile::new(format!(
                            "{}/index.html",
                            settings.server.static_dir
                        )))
                        .fallback(ServeFile::new(format!(
                            "{}/index.html",
                            settings.server.static_dir
                        ))),
                ),
            )
            .route("/api/user", post(async || "Hello Test1"))
            .route("/api/user/create", post(database::user::create));

        app
    }
}
