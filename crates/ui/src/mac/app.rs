use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

use chrono::{FixedOffset, TimeZone, Utc};
use gpui::{actions, div, App, KeyBinding, Menu, MenuItem, ParentElement, Render};
use gpui_component::{button::Button, Icon, Root, TitleBar, WindowExt};
use tokio::time;

pub struct AppState {
    time_stamper: Arc<Mutex<u64>>,
}

actions!(app, [Quit, About]);
impl AppState {
    pub fn new(_: &mut gpui::Context<Self>) -> Self {
        AppState {
            time_stamper: Arc::new(Mutex::new(0)),
        }
    }
    pub fn init(cx: &mut App) {
        cx.set_menus(vec![Menu {
            name: "set_menus".into(),
            items: vec![
                MenuItem::action("About", About),
                MenuItem::action("Quit", Quit),
                // MenuItem::action("Service", )
            ],
        }]);
        cx.activate(true);
        cx.on_action(|_: &Quit, cx| cx.quit());
        cx.on_action(|_: &About, cx| crate::utils::AboutWindow::on_create(cx));
        cx.bind_keys([KeyBinding::new("cmd-q", Quit, None)]);
    }
    pub fn window_option(bounds: gpui::Bounds<gpui::Pixels>) -> gpui::WindowOptions {
        gpui::WindowOptions {
            window_bounds: Some(gpui::WindowBounds::Windowed(bounds)),
            titlebar: Some(gpui::TitlebarOptions {
                appears_transparent: true,
                ..Default::default()
            }),
            ..Default::default()
        }
    }
}

impl Render for AppState {
    fn render(
        &mut self,
        window: &mut gpui::Window,
        cx: &mut gpui::Context<Self>,
    ) -> impl gpui::IntoElement {
        window.on_window_should_close(cx, |_, app| {
            app.quit();
            true
        });
        let dialog_layer = Root::render_dialog_layer(window, cx);
        let time_stamper = self.time_stamper.lock().unwrap();
        let shared_time_stamper = Arc::clone(&self.time_stamper);
        div().children(dialog_layer).child(
            TitleBar::new()
                .child(
                    Button::new("like-btn")
                        .icon(Icon::new(Icon::empty()).path("icons/Fixed.svg"))
                        .on_click(|event, window, app| {
                            window.open_dialog(app, |dialog, window, app| {
                                dialog.title("Welcome").child("This is a dialog dialog.")
                            });
                        }),
                )
                .child(Button::new("start").on_click(move |event, window, app| {
                    let shared_time_stamper = Arc::clone(&shared_time_stamper);
                    let task = app
                        .spawn(async move |async_app| {
                            let mut interval = time::interval(Duration::from_secs(1));
                            let mut count = 0;
                            let client = reqwest::Client::new();
                            let time_stamper =
                                data::utils::time::akamai_stamper(&client).await.unwrap();
                            match time_stamper {
                                data::RequestResult::Success(stamper) => {
                                    *shared_time_stamper.lock().unwrap() = stamper.parse().unwrap();
                                    loop {
                                        interval.tick().await;
                                        *shared_time_stamper.lock().unwrap() += 1;
                                        count += 1;
                                        if let Err(e) = async_app.refresh() {
                                            eprintln!("refresh failed: {:?}  (count={})", e, count);
                                            break; // 退出循环，避免无限 panic
                                        }
                                        println!("update {}", count);
                                    }
                                }
                                _ => {}
                            }
                        })
                        .detach();
                }))
                .child(ts_to_utc8_str(*time_stamper)),
        )
    }
}

pub fn ts_to_utc8_str(ts: u64) -> String {
    let utc_time = Utc
        .timestamp_opt(ts as i64, 0)
        .single()
        .expect("invalid timestamp");
    let utc8 = FixedOffset::east_opt(8 * 3600).unwrap();
    let local = utc_time.with_timezone(&utc8);
    local.format("%Y-%m-%d %H:%M:%S").to_string()
}
