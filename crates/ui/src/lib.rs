pub const VERSION: &str = env!("CARGO_PKG_VERSION");

pub mod app_state;

pub mod components {
    pub mod time;
}

#[cfg(target_os = "macos")]
pub use mac::{dtbox, utils, window_title_bar};
mod mac {
    pub mod dtbox;
    pub mod utils;
    pub mod window_title_bar;
}

#[cfg(target_os = "windows")]
pub use windows::{dtbox, utils, window_title_bar};
mod windows {
    pub mod dtbox;
    pub mod utils;
    pub mod window_title_bar;
}
