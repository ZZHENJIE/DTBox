use crate::components::{WindowTitleBar, WindowTitleBarMessage};
impl WindowTitleBar {
    pub fn to_main_message(message: WindowTitleBarMessage) -> crate::Message {
        crate::Message::MainWindow(crate::window::MainWindowMessage::WindowTitleBar(message))
    }

    pub fn new() -> Self {
        Self {
            is_dragging: false,
            drag_start_position: None,
            window_position: Default::default(),
        }
    }

    pub fn update(&mut self, message: WindowTitleBarMessage) -> iced::Task<crate::Message> {
        match message {
            WindowTitleBarMessage::Minimize(id) => iced::window::minimize(id, true),
            WindowTitleBarMessage::Maximize(id) => iced::window::toggle_maximize(id),
            WindowTitleBarMessage::Close(id) => iced::window::close(id),
            WindowTitleBarMessage::DraggingMove(id, point) => {
                if self.is_dragging {
                    if let Some(start_position) = self.drag_start_position {
                        // 计算鼠标移动的偏移量
                        let delta_x = point.x - start_position.x;
                        let delta_y = point.y - start_position.y;
                        // 计算新的窗口位置
                        let new_x = self.window_position.x + delta_x;
                        let new_y = self.window_position.y + delta_y;
                        // 移动窗口
                        iced::window::move_to(id, iced::Point::new(new_x, new_y))
                    } else {
                        iced::Task::none()
                    }
                } else {
                    iced::Task::none()
                }
            }
            WindowTitleBarMessage::ResetWindowPosition(position) => {
                if let Some(position) = position {
                    self.window_position = position;
                    self.drag_start_position = Some(position);
                }
                iced::Task::none()
            }
            WindowTitleBarMessage::DraggingStart(id) => {
                self.is_dragging = true;
                iced::window::get_position(id).map(|position| {
                    Self::to_main_message(WindowTitleBarMessage::ResetWindowPosition(position))
                })
            }
            WindowTitleBarMessage::DraggingEnd => {
                self.is_dragging = false;
                self.drag_start_position = None;
                iced::Task::none()
            }
        }
    }

    pub fn view(&self, window_id: iced::window::Id) -> iced::Element<'_, crate::Message> {
        iced::widget::row![
            iced::widget::mouse_area(iced::widget::text("Test"))
                .on_press(Self::to_main_message(WindowTitleBarMessage::DraggingStart(
                    window_id
                )))
                .on_release(Self::to_main_message(WindowTitleBarMessage::DraggingEnd))
                .on_move(
                    move |point| Self::to_main_message(WindowTitleBarMessage::DraggingMove(
                        window_id, point
                    ))
                ),
            iced::widget::button("Mini").on_press(Self::to_main_message(
                WindowTitleBarMessage::Minimize(window_id)
            )),
            iced::widget::button("Max").on_press(Self::to_main_message(
                WindowTitleBarMessage::Maximize(window_id)
            )),
            iced::widget::button("Close").on_press(Self::to_main_message(
                WindowTitleBarMessage::Close(window_id)
            ))
        ]
        .into()
    }
}
