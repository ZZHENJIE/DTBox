use std::time::Duration;

use gpui::{actions, div, App, KeyBinding, Menu, MenuItem, ParentElement, Render};
use gpui_component::{button::Button, Icon, TitleBar};

use crate::components;

pub struct AppState {
    time: i64,
}

actions!(app, [Quit, About]);
impl AppState {
    pub fn new(cx: &mut gpui::Context<Self>) -> Self {
        let task = cx
            .spawn(async move |this, async_app| {
                let client = reqwest::Client::new();
                let time = request::utils::time::akamai_stamper(&client).await.unwrap();
                match time {
                    request::RequestResult::Success(data) => {
                        let time: i64 = data.parse().unwrap();
                        let mut count = 0;
                        let _ = this.update(async_app, |this, cx| {
                            this.time = time;
                        });
                        loop {
                            async_app
                                .background_executor()
                                .timer(Duration::from_secs_f32(0.1))
                                .await;
                            let _ = this.update(async_app, |this, cx| {
                                this.time += 1;
                                count += 1;
                                println!("update count :{}", count);
                                cx.notify();
                            });
                        }
                    }
                    request::RequestResult::Error(err) => {
                        println!("err:{}", err);
                    }
                }
            })
            .detach();

        Self { time: 0 }
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

        div().child(
            TitleBar::new()
                .child(
                    Button::new("like-btn")
                        .icon(Icon::new(Icon::empty()).path("icons/Reduce.svg"))
                        .on_click(|event, window, app| {}),
                )
                .child(components::time::Time::ts_to_utc8_str(self.time)),
        )
    }
}
