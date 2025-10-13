pub mod app;
pub mod components {
    pub mod windowtitlebar;
}
pub mod windows {
    pub mod mainwindow;
}

#[derive(Debug, Clone)]
pub enum Message {
    NewWindow(iced::window::Id),
    CloseWindow(iced::window::Id),
    MainWindow(crate::windows::mainwindow::Message),
}
