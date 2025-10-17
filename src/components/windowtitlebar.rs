use crate::WindowTitleBarMessage;

fn to_main_message(msg: WindowTitleBarMessage) -> crate::Message {
    crate::Message::MainWindow(crate::MainWindowMessage::WindowTitleBar(msg))
}

pub fn update(message: WindowTitleBarMessage) -> iced::Task<crate::Message> {
    match message {
        WindowTitleBarMessage::Minimize(id) => iced::window::minimize(id, true),
        WindowTitleBarMessage::Maximize(id) => iced::window::toggle_maximize(id),
        WindowTitleBarMessage::Close(id) => iced::window::close(id),
        WindowTitleBarMessage::TestSend => iced::Task::perform(
            async {
                let response = reqwest::get("https://example.com/").await;
                match response {
                    Ok(response) => {
                        let text = response.text().await.unwrap();
                        Ok(text)
                    }
                    Err(err) => Err(err.to_string()),
                }
            },
            |response| to_main_message(WindowTitleBarMessage::TestResponse(response)),
        ),
        WindowTitleBarMessage::TestResponse(response) => match response {
            Ok(response) => iced::Task::none(),
            Err(err) => iced::Task::none(),
        },
    }
}

pub fn view(window_id: iced::window::Id) -> iced::Element<'static, crate::Message> {
    iced::widget::row![
        iced::widget::button("Mini")
            .on_press(to_main_message(WindowTitleBarMessage::Minimize(window_id))),
        iced::widget::button("Max")
            .on_press(to_main_message(WindowTitleBarMessage::Maximize(window_id))),
        iced::widget::button("Close")
            .on_press(to_main_message(WindowTitleBarMessage::Close(window_id))),
        iced::widget::button("Send").on_press(to_main_message(WindowTitleBarMessage::TestSend)),
    ]
    .into()
}
