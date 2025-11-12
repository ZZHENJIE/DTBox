use std::sync::{Arc, Mutex};

use gpui::{
    actions, div, App, AppContext, ClickEvent, Context, Entity, KeyBinding, Menu, MenuItem,
    ParentElement, Render, Window,
};
use gpui_component::{button::Button, Icon, TitleBar};

use crate::app_state::AppState;
use crate::components;

pub struct DTBox {
    state: Arc<Mutex<AppState>>,
    time: Entity<components::time::Time>,
}

actions!(app, [Quit, About]);
impl DTBox {
    pub fn new(cx: &mut gpui::Context<Self>) -> Self {
        let state = Arc::new(Mutex::new(AppState::new()));
        let state_copy_1 = state.clone();
        let state_copy_2 = state.clone();
        tokio::spawn(async move { state_copy_1.lock().unwrap().init_time_stamper().await });
        let time = cx.new(async |cx| components::time::Time::new(cx, state_copy_2));
        Self { state, time }
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
    pub fn time_start(&mut self, _: &ClickEvent, _window: &mut Window, cx: &mut Context<Self>) {
        self.time.update(cx, |this, async_app| {
            this.change_state(components::time::State::Calibration);
        });
    }
    pub fn time_stop(&mut self, _: &ClickEvent, _window: &mut Window, cx: &mut Context<Self>) {
        self.time.update(cx, |this, async_app| {
            this.change_state(components::time::State::Stop);
        });
    }
}

impl Render for DTBox {
    fn render(
        &mut self,
        window: &mut gpui::Window,
        cx: &mut gpui::Context<Self>,
    ) -> impl gpui::IntoElement {
        window.on_window_should_close(cx, |_, app| {
            app.quit();
            true
        });

        div()
            .child(
                TitleBar::new()
                    .child(
                        Button::new("like-btn")
                            .icon(Icon::new(Icon::empty()).path("icons/Reduce.svg")),
                    )
                    .child(self.time.read(cx).ts_to_utc8_str()),
            )
            .child(
                Button::new("start")
                    .label("Start")
                    .on_click(cx.listener(Self::time_start)),
            )
            .child(
                Button::new("stop")
                    .label("Stop")
                    .on_click(cx.listener(Self::time_stop)),
            )
    }
}
