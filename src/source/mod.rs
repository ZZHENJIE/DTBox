use crate::{AppState, app::api};
use axum::routing;
use std::sync::Arc;

pub mod book_view {
    pub mod cboe;
}

pub mod calendar {
    pub mod ipo {
        pub mod iposcoop;
    }
    pub mod economy {
        pub mod finviz;
    }
    pub mod spac {
        pub mod research;
    }
}

pub mod candlestick {
    pub mod finviz;
}

pub mod event {
    pub mod finviz;
}

pub mod quote {
    pub mod finviz;
    pub mod nasdaq;
}

pub mod screener {
    pub mod finviz;
}

pub mod translate {
    pub mod google;
}

pub mod time_stamp {
    pub mod akamai;
}

pub fn router(
    router: axum::Router<Arc<AppState>>,
    _: Arc<AppState>,
) -> axum::Router<Arc<AppState>> {
    router
        .route(
            "/api/book_view/cboe",
            routing::post(api::post::<book_view::cboe::BookViewCboe>),
        )
        .route(
            "/api/calendar/economy/finviz",
            routing::post(api::post::<calendar::economy::finviz::EconomyFinvizCalendar>),
        )
        .route(
            "/api/calendar/ipo/iposcoop",
            routing::get(api::get::<calendar::ipo::iposcoop::IposcoopCalendar>),
        )
        .route(
            "/api/calendar/spac/research",
            routing::get(api::get::<calendar::spac::research::SpacResearchCalendar>),
        )
        .route(
            "/api/candlestick/finviz",
            routing::post(api::post::<candlestick::finviz::CandlestickFinviz>),
        )
        .route(
            "/api/event/finviz",
            routing::post(api::post::<event::finviz::EventFinviz>),
        )
        .route(
            "/api/quote/finviz",
            routing::post(api::post::<quote::finviz::QuoteFinviz>),
        )
        .route(
            "/api/quote/nasdaq",
            routing::post(api::post::<quote::nasdaq::QuoteNasdaq>),
        )
        .route(
            "/api/screener/finviz",
            routing::post(api::post::<screener::finviz::ScreenerFinviz>),
        )
        .route(
            "/api/time_stamp/akamai",
            routing::get(api::get::<time_stamp::akamai::AkamaiTimeStamp>),
        )
        .route(
            "/api/translate/google",
            routing::post(api::post::<translate::google::GoogleTranslate>),
        )
}
