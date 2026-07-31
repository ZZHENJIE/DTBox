use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

use axum::{
    extract::State,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use shared::ApiResponse;
use tokio::sync::Mutex;

use crate::config::Config;

struct ClientState {
    count: u64,
    reset_at: Instant,
}

#[derive(Clone)]
pub struct RateLimiter {
    max_requests: u64,
    window: Duration,
    clients: Arc<Mutex<HashMap<String, ClientState>>>,
}

impl RateLimiter {
    pub fn new(config: &Config) -> Self {
        Self {
            max_requests: config.rate_limiter.max_requests,
            window: Duration::from_secs(config.rate_limiter.window_seconds),
            clients: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

pub async fn rate_limit(
    State(limiter): State<RateLimiter>,
    request: axum::http::Request<axum::body::Body>,
    next: Next,
) -> Response {
    let client_ip = request
        .headers()
        .get("X-Real-IP")
        .or_else(|| request.headers().get("X-Forwarded-For"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    let allowed = {
        let mut clients = limiter.clients.lock().await;
        let now = Instant::now();
        let entry = clients.entry(client_ip).or_insert(ClientState {
            count: 0,
            reset_at: now + limiter.window,
        });

        if now > entry.reset_at {
            entry.count = 0;
            entry.reset_at = now + limiter.window;
        }

        if entry.count >= limiter.max_requests {
            false
        } else {
            entry.count += 1;
            true
        }
    };

    if !allowed {
        let body = Json(ApiResponse::<()>::error("Too many requests"));
        return (StatusCode::TOO_MANY_REQUESTS, body).into_response();
    }

    next.run(request).await
}
