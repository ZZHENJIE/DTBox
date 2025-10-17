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
    MainWindow(MainWindowMessage),
}

#[derive(Debug, Clone)]
pub enum MainWindowMessage {
    WindowTitleBar(WindowTitleBarMessage),
}

#[derive(Debug, Clone)]
pub enum WindowTitleBarMessage {
    Close(iced::window::Id),
    Minimize(iced::window::Id),
    Maximize(iced::window::Id),
    TestSend,
    TestResponse(Result<String, String>),
}
