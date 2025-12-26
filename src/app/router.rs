use crate::AppState;
use axum::routing;
use std::sync::Arc;
use tower_http::services::ServeDir;

trait RouterExt: Sized {
    #[inline]
    fn pipe<F>(self, f: F) -> Self
    where
        F: FnOnce(Self) -> Self,
    {
        f(self)
    }
}
impl RouterExt for axum::Router<Arc<AppState>> {}

pub fn new(state: Arc<AppState>) -> axum::Router<Arc<AppState>> {
    axum::Router::new()
        .fallback_service(ServeDir::new(&state.settings().server.static_dir))
        .pipe(router)
        .pipe(crate::source::router)
        .pipe(crate::database::router)
}

fn router(router: axum::Router<Arc<AppState>>) -> axum::Router<Arc<AppState>> {
    router.route(
        "/api/version",
        routing::get(async || env!("CARGO_PKG_VERSION")),
    )
}
