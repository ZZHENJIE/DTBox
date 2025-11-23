pub mod fetch {
    // pub mod cboe {
    //     pub mod market;
    //     pub mod symbol;
    // }
    // pub mod finviz {
    //     // pub mod candlestick;
    //     // pub mod news;
    //     pub mod screener;
    // }
    // pub mod market;
    // pub mod nasdaq;
    pub mod utils {
        pub mod language;
        pub mod time;
        pub mod translate;
    }
}

pub mod app {
    pub mod router;
    pub mod state;
}

pub mod database {
    pub mod book_view;
    pub mod stocks;
    pub mod user;
}

pub mod utils {
    pub mod error;
    pub mod settings;
    pub mod token;
}

pub use app::router::Router;
pub use app::state::AppState;
pub use utils::error::Error;
pub use utils::settings::Settings;
pub use utils::token::Token;

pub type ResponseResult<T> = Result<T, utils::error::Error>;
