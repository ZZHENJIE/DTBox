use crate::{
    Message,
    window::{self, WindowMessage},
};

#[derive(Default)]
pub struct Window {
    title: String,
    scale_input: String,
    current_scale: f64,
    theme: iced::Theme,
}

impl Window {
    pub fn settings() -> iced::window::Settings {
        let mut settings = iced::window::Settings::default();
        settings.decorations = false;
        settings
    }
}

#[derive(Default)]
pub struct AppState {
    window_list: std::collections::BTreeMap<iced::window::Id, Window>,
    mainwindow: window::MainWindow,
}

impl AppState {
    pub fn new() -> (Self, iced::Task<Message>) {
        let (_, open) = iced::window::open(Window::settings());
        (
            AppState::default(),
            open.map(|id| Message::Window(WindowMessage::NewWindow(id))),
        )
    }
    pub fn update(&mut self, message: Message) -> iced::Task<Message> {
        match message {
            Message::Window(window_message) => match window_message {
                WindowMessage::NewWindow(id) => {
                    self.window_list.insert(id, Window::default());
                    iced::Task::none()
                }
                WindowMessage::CloseWindow(id) => {
                    self.window_list.remove(&id);
                    if self.window_list.is_empty() {
                        iced::exit()
                    } else {
                        iced::Task::none()
                    }
                }
            },
            Message::MainWindow(mainwindow_message) => self.mainwindow.update(mainwindow_message),
        }
    }
    pub fn view(&self, window_id: iced::window::Id) -> iced::Element<'_, Message> {
        self.mainwindow.view(window_id)
    }
    pub fn subscription(&self) -> iced::Subscription<Message> {
        iced::window::close_events().map(|id| Message::Window(WindowMessage::CloseWindow(id)))
    }
}
