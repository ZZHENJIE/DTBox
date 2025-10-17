use crate::components::windowtitlebar;

#[derive(Default)]
pub struct MainWindow {}

impl MainWindow {
    pub fn update(&mut self, message: crate::MainWindowMessage) -> iced::Task<crate::Message> {
        match message {
            crate::MainWindowMessage::WindowTitleBar(message) => windowtitlebar::update(message),
        }
    }
    pub fn view(&self, window_id: iced::window::Id) -> iced::Element<'_, crate::Message> {
        windowtitlebar::view(window_id)
    }
}
