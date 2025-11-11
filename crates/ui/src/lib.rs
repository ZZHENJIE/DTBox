pub const VERSION: &str = env!("CARGO_PKG_VERSION");

pub mod components {
    pub mod time;
}

#[cfg(target_os = "macos")]
pub use mac::{app, utils, window_title_bar};
mod mac {
    pub mod app;
    pub mod utils;
    pub mod window_title_bar;
}

#[cfg(target_os = "windows")]
pub use windows::{app, utils, window_title_bar};
mod windows {
    pub mod app;
    pub mod utils;
    pub mod window_title_bar;
}
