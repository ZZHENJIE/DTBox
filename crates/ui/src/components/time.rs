use chrono::{FixedOffset, TimeZone, Utc};
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

#[derive(Clone, Copy)]
pub enum State {
    Stop,
    Start,
    Calibration,
}

pub struct Time {
    time_stamper: i64,
    state: State,
}

impl Time {
    pub fn new(
        cx: &mut gpui::Context<Self>,
        app_state: Arc<Mutex<crate::app_state::AppState>>,
    ) -> Self {
        cx.spawn(async move |this, async_app| {
            let is_calibration = Arc::new(Mutex::new(false));
            loop {
                async_app
                    .background_executor()
                    .timer(Duration::from_secs(1))
                    .await;
                let is_calibration_shared = is_calibration.clone();
                let _ = this.update(async_app, move |this, cx| match this.state {
                    State::Calibration => {
                        *is_calibration_shared.lock().unwrap() = true;
                    }
                    State::Start => {
                        this.time_stamper += 1;
                        cx.notify();
                    }
                    State::Stop => {}
                });
                if *is_calibration.lock().unwrap() {
                    match request::utils::time::akamai_stamper(
                        app_state.lock().unwrap().http_client(),
                    )
                    .await
                    .unwrap()
                    {
                        request::RequestResult::Success(data) => {
                            let time: i64 = data.parse().unwrap();
                            let _ = this.update(async_app, move |this, cx| {
                                this.time_stamper = time;
                                this.state = State::Start;
                            });
                            *is_calibration.lock().unwrap() = false;
                        }
                        request::RequestResult::Error(err) => {
                            println!("err:{}", err);
                        }
                    }
                }
            }
        })
        .detach();
        Self {
            time_stamper: 0,
            state: State::Stop,
        }
    }
    fn calibration(&mut self, cx: &mut gpui::Context<Self>) {
        cx.spawn(async move |entity, async_app| {}).detach();
    }
    pub fn change_state(&mut self, state: State) {
        self.state = state;
    }
    pub fn ts_to_utc8_str(&self) -> String {
        let utc_time = Utc
            .timestamp_opt(self.time_stamper, 0)
            .single()
            .expect("invalid timestamp");
        let utc8 = FixedOffset::east_opt(8 * 3600).unwrap();
        let local = utc_time.with_timezone(&utc8);
        local.format("%Y-%m-%d %H:%M:%S").to_string()
    }
}
