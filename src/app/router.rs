use crate::{
    AppState,
    data_source::{self, Source},
};
// use crate::database;
use axum::routing::{get_service, post};
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
                post(data_source::book_view::cboe::BookViewCboe::post),
            )
            .route(
                "/api/calendar/economy/finviz",
                post(data_source::calendar::economy::finviz::EconomyFinvizCalendar::post),
            )
            .route(
                "/api/calendar/ipo/iposcoop",
                post(data_source::calendar::ipo::iposcoop::IposcoopCalendar::post),
            )
            .route(
                "/api/calendar/spac/research",
                post(data_source::calendar::spac::research::SpacResearchCalendar::post),
            )
            .route(
                "/api/candlestick/finviz",
                post(data_source::candlestick::finviz::CandlestickFinviz::post),
            )
            .route(
                "/api/event/finviz",
                post(data_source::event::finviz::EventFinviz::post),
            )
            .route(
                "/api/quote/finviz",
                post(data_source::quote::finviz::QuoteFinviz::post),
            )
            .route(
                "/api/quote/nasdaq",
                post(data_source::quote::nasdaq::QuoteNasdaq::post),
            )
            .route(
                "/api/screener/finviz",
                post(data_source::screener::finviz::ScreenerFinviz::post),
            )
            .route(
                "/api/time_stamp/akamai",
                post(data_source::time_stamp::akamai::AkamaiTimeStamp::post),
            )
            .route(
                "/api/translate/google",
                post(data_source::translate::google::GoogleTranslate::post),
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
