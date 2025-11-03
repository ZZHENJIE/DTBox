use gpui::{App, KeyBinding, Menu, MenuItem, Render, actions, div};

pub struct AppState {}

actions!(app, [Quit, About]);
impl AppState {
    pub fn new(_: &mut gpui::Context<Self>) -> Self {
        Self {}
    }
    pub fn init(cx: &mut App) {
        cx.set_menus(vec![Menu {
            name: "set_menus".into(),
            items: vec![
                MenuItem::action("About", About),
                MenuItem::action("Quit", Quit),
            ],
        }]);
        cx.activate(true);
        cx.on_action(|_: &Quit, cx| cx.quit());
        cx.on_action(|_: &About, cx| crate::utils::AboutWindow::on_create(cx));
        cx.bind_keys([KeyBinding::new("cmd-q", Quit, None)]);
    }
    pub fn window_option(bounds: gpui::Bounds<gpui::Pixels>) -> gpui::WindowOptions {
        gpui::WindowOptions {
            window_bounds: Some(gpui::WindowBounds::Windowed(bounds)),
            titlebar: Some(gpui::TitlebarOptions {
                appears_transparent: true,
                ..Default::default()
            }),
            ..Default::default()
        }
    }
}

impl Render for AppState {
    fn render(
        &mut self,
        window: &mut gpui::Window,
        cx: &mut gpui::Context<Self>,
    ) -> impl gpui::IntoElement {
        window.on_window_should_close(cx, |_, app| {
            app.quit();
            true
        });
        div()
    }
}
