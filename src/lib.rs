pub mod app;
pub mod components {
    #[derive(Debug, Clone)]
    pub enum WindowTitleBarMessage {
        Close(iced::window::Id),
        Minimize(iced::window::Id),
        Maximize(iced::window::Id),
        DraggingStart(iced::window::Id),
        DraggingEnd,
        DraggingMove(iced::window::Id, iced::Point),
        ResetWindowPosition(Option<iced::Point>),
    }
    #[derive(Default)]
    pub struct WindowTitleBar {
        is_dragging: bool,
        drag_start_position: Option<iced::Point>,
        window_position: iced::Point,
    }
    mod windowtitlebar;
}
pub mod window {
    #[derive(Debug, Clone)]
    pub enum WindowMessage {
        NewWindow(iced::window::Id),
        CloseWindow(iced::window::Id),
    }
    #[derive(Debug, Clone)]
    pub enum MainWindowMessage {
        WindowTitleBar(super::components::WindowTitleBarMessage),
    }
    #[derive(Default)]
    pub struct MainWindow {
        windowtitlebar: super::components::WindowTitleBar,
    }
    mod mainwindow;
}

#[derive(Debug, Clone)]
pub enum Message {
    Window(window::WindowMessage),
    MainWindow(window::MainWindowMessage),
}
