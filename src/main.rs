use gpui::{px, App, AppContext, Bounds, Size};
use gpui_component::Root;
use ui::dtbox::DTBox;

#[tokio::main]
async fn main() {
    let app = gpui::Application::new().with_assets(assets::Assets);

    app.run(move |cx: &mut App| {
        gpui_component::init(cx);

        let bounds = Bounds::centered(
            None,
            Size {
                width: px(400.0),
                height: px(300.0),
            },
            cx,
        );

        cx.spawn(async move |async_app| {
            let app_state = ui::app_state::AppState::new(async_app);
            let _ = async_app.open_window(DTBox::window_option(bounds), |window, cx| {
                let view = cx.new(|cx| DTBox::new(cx));
                cx.new(|cx| Root::new(view.into(), window, cx))
            });
        })
        .detach();
    });
}
