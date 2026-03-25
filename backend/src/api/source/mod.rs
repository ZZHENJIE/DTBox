use crate::{api::handler, app};
use axum::routing::{get, post};
use std::sync::Arc;

pub mod book_view {
    pub mod cboe;
}

pub mod calendar {
    pub mod economy {
        pub mod finviz;
    }
    pub mod ipo {
        pub mod scoop;
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

pub mod utils {
    pub mod translate {
        pub mod google;
    }

    pub mod time_stamp {
        pub mod akamai;
    }
}

type Router = axum::Router<Arc<app::State>>;

pub fn register() -> Router {
    Router::new()
        .route(
            "/api/book_view/cboe",
            post(handler::post::<book_view::cboe::BookViewCboe>),
        )
        .route(
            "/api/calendar/economy/finviz",
            post(handler::post::<calendar::economy::finviz::EconomyFinvizCalendar>),
        )
        .route(
            "/api/calendar/ipo/scoop",
            get(handler::get::<calendar::ipo::scoop::IposcoopCalendar>),
        )
        .route(
            "/api/calendar/spac/research",
            get(handler::get::<calendar::spac::research::SpacResearchCalendar>),
        )
        .route(
            "/api/candlestick/finviz",
            post(handler::post::<candlestick::finviz::CandlestickFinviz>),
        )
        .route(
            "/api/event/finviz",
            post(handler::post::<event::finviz::EventFinviz>),
        )
        .route(
            "/api/quote/finviz",
            post(handler::post::<quote::finviz::QuoteFinviz>),
        )
        .route(
            "/api/quote/nasdaq",
            post(handler::post::<quote::nasdaq::QuoteNasdaq>),
        )
        .route(
            "/api/screener/finviz",
            post(handler::post::<screener::finviz::ScreenerFinviz>),
        )
        .route(
            "/api/time_stamp/akamai",
            get(handler::get::<utils::time_stamp::akamai::AkamaiTimeStamp>),
        )
        .route(
            "/api/translate/google",
            post(handler::post::<utils::translate::google::GoogleTranslate>),
        )
}
