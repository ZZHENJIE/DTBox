use crate::{AppState, app::api, database, source, utils};
use axum::routing;
use std::sync::Arc;
use tower_http::services::ServeDir;

pub fn new(settings: &crate::Settings) -> axum::Router<Arc<AppState>> {
    let static_dir = &settings.server.static_dir;
    axum::Router::new()
        .fallback_service(ServeDir::new(static_dir))
        .pipe(ultils_router)
        .pipe(source_router)
        .pipe(database_router)
}

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

fn ultils_router(router: axum::Router<Arc<AppState>>) -> axum::Router<Arc<AppState>> {
    router.route("/api/version", routing::get(utils::tool::version))
}

fn source_router(router: axum::Router<Arc<AppState>>) -> axum::Router<Arc<AppState>> {
    router
        .route(
            "/api/book_view/cboe",
            routing::post(api::post::<source::book_view::cboe::BookViewCboe>),
        )
        .route(
            "/api/calendar/economy/finviz",
            routing::post(api::post::<source::calendar::economy::finviz::EconomyFinvizCalendar>),
        )
        .route(
            "/api/calendar/ipo/iposcoop",
            routing::get(api::get::<source::calendar::ipo::iposcoop::IposcoopCalendar>),
        )
        .route(
            "/api/calendar/spac/research",
            routing::get(api::get::<source::calendar::spac::research::SpacResearchCalendar>),
        )
        .route(
            "/api/candlestick/finviz",
            routing::post(api::post::<source::candlestick::finviz::CandlestickFinviz>),
        )
        .route(
            "/api/event/finviz",
            routing::post(api::post::<source::event::finviz::EventFinviz>),
        )
        .route(
            "/api/quote/finviz",
            routing::post(api::post::<source::quote::finviz::QuoteFinviz>),
        )
        .route(
            "/api/quote/nasdaq",
            routing::post(api::post::<source::quote::nasdaq::QuoteNasdaq>),
        )
        .route(
            "/api/screener/finviz",
            routing::post(api::post::<source::screener::finviz::ScreenerFinviz>),
        )
        .route(
            "/api/time_stamp/akamai",
            routing::get(api::get::<source::time_stamp::akamai::AkamaiTimeStamp>),
        )
        .route(
            "/api/translate/google",
            routing::post(api::post::<source::translate::google::GoogleTranslate>),
        )
}

fn database_router(router: axum::Router<Arc<AppState>>) -> axum::Router<Arc<AppState>> {
    router
        .route(
            "/api/user/register",
            routing::post(api::post::<database::user::register::Register>),
        )
        .route(
            "/api/user/signin",
            routing::post(api::post::<database::user::signin::Signin>),
        )
        .route(
            "/api/user/name_is_exists",
            routing::post(api::post::<database::user::name_is_exists::NameIsExists>),
        )
}
