use dtbox_ui::app::AppState;
use gpui::{App, AppContext, Application, Bounds, Size, px};

fn main() {
    Application::new().run(|cx: &mut App| {
        gpui_component::init(cx);
        AppState::init(cx);

        let bounds = Bounds::centered(
            None,
            Size {
                width: px(400.0),
                height: px(300.0),
            },
            cx,
        );

        cx.open_window(AppState::window_option(bounds), |_, cx| {
            cx.new(|cx| AppState::new(cx))
        })
        .unwrap_or_else(|error| panic!("{:#?}", error));
    });
}
