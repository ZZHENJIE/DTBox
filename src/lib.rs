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
        // pub mod time;
        pub mod translate;
    }
}

pub mod app {
    pub mod settings;
    pub mod state;
}

pub use app::settings::Settings;
pub use app::state::AppState;

// pub mod database {
//     pub mod user;
// }
