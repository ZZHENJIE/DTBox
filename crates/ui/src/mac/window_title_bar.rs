use gpui::{div, IntoElement, RenderOnce};

#[derive(IntoElement, Clone, Copy)]
pub struct WindowTitleBar;

impl RenderOnce for WindowTitleBar {
    fn render(self, window: &mut gpui::Window, cx: &mut gpui::App) -> impl gpui::IntoElement {
        div()
    }
}
