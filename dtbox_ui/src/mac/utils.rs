use gpui::{
    App, AppContext, Bounds, ParentElement, Point, Render, SharedString, Size, Styled,
    WindowControlArea, WindowOptions, div, px,
};

pub struct AboutWindow;

impl AboutWindow {
    fn new(_: &mut gpui::Context<Self>) -> Self {
        Self {}
    }
    pub fn on_create(cx: &mut App) {
        let _ = cx.open_window(Self::window_options(cx), |_, app| {
            app.new(|cx| Self::new(cx))
        });
    }
    fn window_options(cx: &App) -> WindowOptions {
        WindowOptions {
            window_bounds: Some(gpui::WindowBounds::Windowed(Bounds::centered(
                None,
                Size {
                    width: px(300.0),
                    height: px(100.0),
                },
                cx,
            ))),
            titlebar: Some(gpui::TitlebarOptions {
                appears_transparent: true,
                title: Some(SharedString::from("About")),
                ..Default::default()
            }),
            ..Default::default()
        }
    }
}

impl Render for AboutWindow {
    fn render(
        &mut self,
        window: &mut gpui::Window,
        cx: &mut gpui::Context<Self>,
    ) -> impl gpui::IntoElement {
        div()
            .text_center()
            .text_color(gpui::white())
            .pt_1()
            .child(SharedString::from(crate::VERSION))
    }
}
