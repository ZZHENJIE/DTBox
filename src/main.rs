use dt_box::app::AppState;

fn main() -> iced::Result {
    iced::daemon("DTBox", AppState::update, AppState::view)
        .subscription(AppState::subscription)
        .run_with(AppState::new)
}
