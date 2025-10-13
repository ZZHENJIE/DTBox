#[derive(Default)]
pub struct MainWindow {}

#[derive(Debug, Clone)]
pub enum Message {
    Test(iced::window::Id),
}

impl MainWindow {
    pub fn update(&mut self, message: Message) -> iced::Task<crate::Message> {
        match message {
            Message::Test(id) => {
                println!("{:#?}", id)
            }
        }
        iced::Task::none()
    }
    pub fn view(&self, window_id: iced::window::Id) -> iced::Element<'_, crate::Message> {
        iced::widget::center(
            iced::widget::button("Hello")
                .on_press(crate::Message::MainWindow(Message::Test(window_id))),
        )
        .into()
    }
}
