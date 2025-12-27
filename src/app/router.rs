use crate::AppState;
use axum::routing;
use std::sync::Arc;
use tower_http::services::ServeDir;

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
    axum::Router::new()
        .fallback_service(ServeDir::new(&state.settings().server.static_dir))
        .pipe(router, state.clone())
        .pipe(crate::source::router, state.clone())
}

fn router(router: axum::Router<Arc<AppState>>, _: Arc<AppState>) -> axum::Router<Arc<AppState>> {
    router.route(
        "/api/version",
        routing::get(async || env!("CARGO_PKG_VERSION")),
    )
}
