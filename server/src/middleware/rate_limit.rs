use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};

use axum::{
    extract::{ConnectInfo, State},
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
        let limiter = Self {
            max_requests: config.rate_limiter.max_requests,
            window: Duration::from_secs(config.rate_limiter.window_seconds),
            clients: Arc::new(Mutex::new(HashMap::new())),
        };
        limiter.spawn_cleanup();
        limiter
    }

    pub fn new_login_limiter() -> Self {
        let limiter = Self {
            max_requests: 5,
            window: Duration::from_secs(60),
            clients: Arc::new(Mutex::new(HashMap::new())),
        };
        limiter.spawn_cleanup();
        limiter
    }

    fn spawn_cleanup(&self) {
        let clients = self.clients.clone();
        let window = self.window;
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(window).await;
                let mut map = clients.lock().await;
                let now = Instant::now();
                map.retain(|_, v| now <= v.reset_at);
            }
        });
    }
}

pub fn client_ip(addr: SocketAddr, headers: &axum::http::HeaderMap) -> String {
    headers
        .get("X-Real-IP")
        .or_else(|| headers.get("X-Forwarded-For"))
        .and_then(|v| v.to_str().ok())
        .map(|v| v.to_string())
        .unwrap_or_else(|| addr.ip().to_string())
}

async fn check_and_increment(
    limiter: &RateLimiter,
    key: String,
) -> bool {
    let mut clients = limiter.clients.lock().await;
    let now = Instant::now();
    let entry = clients.entry(key).or_insert(ClientState {
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
}

pub async fn rate_limit(
    State(limiter): State<RateLimiter>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: axum::http::Request<axum::body::Body>,
    next: Next,
) -> Response {
    let ip = client_ip(addr, request.headers());

    if !check_and_increment(&limiter, ip).await {
        let body = Json(ApiResponse::<()>::error("Too many requests"));
        return (StatusCode::TOO_MANY_REQUESTS, body).into_response();
    }

    next.run(request).await
}

pub async fn login_rate_limit(
    State(limiter): State<RateLimiter>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: axum::http::Request<axum::body::Body>,
    next: Next,
) -> Response {
    let ip = client_ip(addr, request.headers());

    if !check_and_increment(&limiter, ip).await {
        let body = Json(ApiResponse::<()>::error("Too many login attempts, try again later"));
        return (StatusCode::TOO_MANY_REQUESTS, body).into_response();
    }

    next.run(request).await
}
