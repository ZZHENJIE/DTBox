use crate::AppState;
use axum::routing;
use std::{path::PathBuf, sync::Arc};
use tower_http::services::{ServeDir, ServeFile};

trait RouterExt: Sized {
    #[inline]
    fn pipe<F, S>(self, f: F, s: S) -> Self
    where
        F: FnOnce(Self, S) -> Self,
    {
        f(self, s)
    }
}
impl RouterExt for axum::Router<Arc<AppState>> {}

pub fn new(state: Arc<AppState>) -> axum::Router<Arc<AppState>> {
    let web_path = PathBuf::from(&state.settings().web.path);
    let service = ServeDir::new(&web_path).fallback(ServeFile::new(web_path.join("index.html")));
    axum::Router::new()
        .fallback_service(service)
        .pipe(router, state.clone())
        .pipe(crate::source::router, state.clone())
}

fn router(router: axum::Router<Arc<AppState>>, _: Arc<AppState>) -> axum::Router<Arc<AppState>> {
    router.route(
        "/api/version",
        routing::get(async || env!("CARGO_PKG_VERSION")),
    )
}
