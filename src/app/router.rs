use crate::{AppState, app::api, data_source, database};
// use crate::database;
use axum::routing::{self, get_service};
use std::sync::Arc;
use tower_http::services::{ServeDir, ServeFile};

pub struct Router;

impl Router {
    pub fn new(settings: &crate::Settings) -> axum::Router<Arc<AppState>> {
        axum::Router::new()
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
            .route(
                "/api/book_view/cboe",
                routing::post(api::post::<data_source::book_view::cboe::BookViewCboe>),
            )
            .route(
                "/api/calendar/economy/finviz",
                routing::post(
                    api::post::<data_source::calendar::economy::finviz::EconomyFinvizCalendar>,
                ),
            )
            .route(
                "/api/calendar/ipo/iposcoop",
                routing::get(api::get::<data_source::calendar::ipo::iposcoop::IposcoopCalendar>),
            )
            .route(
                "/api/calendar/spac/research",
                routing::get(
                    api::get::<data_source::calendar::spac::research::SpacResearchCalendar>,
                ),
            )
            .route(
                "/api/candlestick/finviz",
                routing::post(api::post::<data_source::candlestick::finviz::CandlestickFinviz>),
            )
            .route(
                "/api/event/finviz",
                routing::post(api::post::<data_source::event::finviz::EventFinviz>),
            )
            .route(
                "/api/quote/finviz",
                routing::post(api::post::<data_source::quote::finviz::QuoteFinviz>),
            )
            .route(
                "/api/quote/nasdaq",
                routing::post(api::post::<data_source::quote::nasdaq::QuoteNasdaq>),
            )
            .route(
                "/api/screener/finviz",
                routing::post(api::post::<data_source::screener::finviz::ScreenerFinviz>),
            )
            .route(
                "/api/time_stamp/akamai",
                routing::get(api::get::<data_source::time_stamp::akamai::AkamaiTimeStamp>),
            )
            .route(
                "/api/translate/google",
                routing::post(api::post::<data_source::translate::google::GoogleTranslate>),
            )
            .route(
                "/api/user/register",
                routing::post(api::post::<database::user::register::Register>),
            )
            .route(
                "/api/user/signin",
                routing::post(api::post::<database::user::signin::Signin>),
            )
        // .route(
        //     "/api/user/name_exists/{name}",
        //     get(database::user::name_is_exist),
        // )
        // .route("/api/user/create", post(database::user::create))
        // .route(
        //     "/api/user/change_password",
        //     post(database::user::change_password),
        // )
        // .route("/api/user/update", post(database::user::update))
        // .route("/api/user/login", post(database::user::login))
        // .route("/api/user/info", post(database::user::info));
    }
}
