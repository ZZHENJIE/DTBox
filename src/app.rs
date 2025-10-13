use crate::{Message, windows};

#[derive(Default)]
pub struct Window {
    title: String,
    scale_input: String,
    current_scale: f64,
    theme: iced::Theme,
}

#[derive(Default)]
pub struct AppState {
    windows: std::collections::BTreeMap<iced::window::Id, Window>,
    mainwindow: windows::mainwindow::MainWindow,
}

impl AppState {
    pub fn new() -> (Self, iced::Task<Message>) {
        let (_, open) = iced::window::open(iced::window::Settings::default());
        (AppState::default(), open.map(Message::NewWindow))
    }
    pub fn update(&mut self, message: Message) -> iced::Task<Message> {
        match message {
            Message::NewWindow(id) => {
                let window = Window::default();
                self.windows.insert(id, window);
                iced::Task::none()
            }
            Message::CloseWindow(id) => {
                self.windows.remove(&id);
                if self.windows.is_empty() {
                    iced::exit()
                } else {
                    iced::Task::none()
                }
            }
            Message::MainWindow(message) => self.mainwindow.update(message),
        }
    }
    pub fn view(&self, window_id: iced::window::Id) -> iced::Element<'_, Message> {
        self.mainwindow.view(window_id)
    }
    pub fn subscription(&self) -> iced::Subscription<Message> {
        iced::window::close_events().map(Message::CloseWindow)
    }
}
