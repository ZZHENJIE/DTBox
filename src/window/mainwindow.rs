use crate::window::{MainWindow, MainWindowMessage};

impl MainWindow {
    pub fn update(&mut self, message: MainWindowMessage) -> iced::Task<crate::Message> {
        match message {
            MainWindowMessage::WindowTitleBar(message) => self.windowtitlebar.update(message),
        }
    }
    pub fn view(&self, window_id: iced::window::Id) -> iced::Element<'_, crate::Message> {
        self.windowtitlebar.view(window_id)
    }
}
