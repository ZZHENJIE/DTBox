pub mod components {}

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

use gpui_component::Root;
#[cfg(target_os = "macos")]
pub use mac::{app, utils, window_title_bar};
mod mac {
    pub mod app;
    pub mod utils;
    pub mod window_title_bar;
}

pub mod assets;

#[cfg(target_os = "windows")]
pub use windows::{app, utils, window_title_bar};
mod windows {
    pub mod app;
    pub mod utils;
    pub mod window_title_bar;
}
use gpui::{px, App, AppContext, Application, Bounds, Size};

pub async fn run() {
    Application::new()
        .with_assets(assets::Assets)
        .run(|cx: &mut App| {
            gpui_component::init(cx);
            mac::app::AppState::init(cx);

            let bounds = Bounds::centered(
                None,
                Size {
                    width: px(400.0),
                    height: px(300.0),
                },
                cx,
            );

            cx.open_window(mac::app::AppState::window_option(bounds), |window, cx| {
                let view = cx.new(|cx| mac::app::AppState::new(cx));
                cx.new(|cx| Root::new(view.into(), window, cx))
            })
            .unwrap_or_else(|error| panic!("{:#?}", error));
        });
}
