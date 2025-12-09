pub mod app {
    pub mod error;
    pub mod router;
    pub mod settings;
    pub mod state;
}

// pub mod database {
//     pub mod book_view;
//     pub mod stocks;
//     pub mod user;
// }

pub mod utils {
    pub mod market;
    pub mod tool;
    pub mod translate;
}

pub use app::error::Error;
pub use app::router::Router;
pub use app::settings::Settings;
pub use app::state::AppState;

pub type ResponseResult<T> = Result<T, app::error::Error>;

pub mod data_source;
