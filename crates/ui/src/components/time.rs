use chrono::{FixedOffset, TimeZone, Utc};
use std::sync::{Arc, Mutex};

pub struct Time {
    time_stamper: Arc<Mutex<i64>>,
}

impl Time {
    pub fn new() -> Self {
        Self {
            time_stamper: Arc::new(Mutex::new(0)),
        }
    }
    pub fn calibration(&mut self) {
        let shared_time = Arc::clone(&self.time_stamper);
        tokio::spawn(async move {
            let client = reqwest::Client::new();
            let response = request::utils::time::akamai_stamper(&client).await.unwrap();
            match response {
                request::RequestResult::Success(data) => {
                    *shared_time.lock().unwrap() = data.parse().unwrap();
                }
                request::RequestResult::Error(err) => {
                    log::error!("Failed to calibrate time: {}", err);
                }
            }
        });
    }
    // pub fn ts_to_utc8_str(&self) -> String {
    //     let utc_time = Utc
    //         .timestamp_opt(*self.time_stamper.lock().unwrap(), 0)
    //         .single()
    //         .expect("invalid timestamp");
    //     let utc8 = FixedOffset::east_opt(8 * 3600).unwrap();
    //     let local = utc_time.with_timezone(&utc8);
    //     local.format("%Y-%m-%d %H:%M:%S").to_string()
    // }
    pub fn ts_to_utc8_str(time: i64) -> String {
        let utc_time = Utc
            .timestamp_opt(time, 0)
            .single()
            .expect("invalid timestamp");
        let utc8 = FixedOffset::east_opt(8 * 3600).unwrap();
        let local = utc_time.with_timezone(&utc8);
        local.format("%Y-%m-%d %H:%M:%S").to_string()
    }
}
