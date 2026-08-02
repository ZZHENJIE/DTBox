use std::net::SocketAddr;

use axum::{
    middleware,
    routing::{get, post},
    Router,
};
use sea_orm::Database;
use server::config::Config;
use server::handler::{admin, health, user};
use server::middleware::rate_limit::{self, RateLimiter};
use server::AppState;
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let config = Config::load().expect("Failed to load config");

    let db = Database::connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    server::db::init_database(&db)
        .await
        .expect("Failed to initialize database schema");

    let redis = match redis::Client::open(config.redis_url.as_str()) {
        Ok(client) => match client.get_multiplexed_async_connection().await {
            Ok(conn) => Some(conn),
            Err(e) => {
                tracing::warn!("Redis connection failed: {}, AccessToken blacklist disabled", e);
                None
            }
        },
        Err(e) => {
            tracing::warn!("Redis client failed: {}, AccessToken blacklist disabled", e);
            None
        }
    };

    let state = AppState {
        db,
        redis,
        config: config.clone(),
    };

    let rate_limiter = RateLimiter::new(&config);

    let login_rate_limiter = RateLimiter::new_login_limiter();

    let login_route = Router::new()
        .route("/login", post(user::login))
        .layer(middleware::from_fn_with_state(
            login_rate_limiter,
            rate_limit::login_rate_limit,
        ));

    let user_routes = Router::new()
        .route("/check", get(user::check_user))
        .route("/create", post(user::create_user))
        .route("/logout", post(user::logout))
        .route("/password", post(user::change_password))
        .route("/profile", post(user::update_profile))
        .route("/refresh", get(user::refresh_token))
        .route("/me", get(user::me));

    let admin_routes = Router::new()
        .route("/info/{page}", get(admin::get_user_list))
        .route("/change", post(admin::change_user));

    let app = Router::new()
        .route("/api/health", get(health::health_check))
        .nest("/api/user", user_routes.merge(login_route))
        .nest("/api/admin", admin_routes)
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(10 * 1024 * 1024))
        .layer(middleware::from_fn_with_state(
            rate_limiter,
            rate_limit::rate_limit,
        ))
        .with_state(state);

    let addr = format!("{}:{}", config.server.host, config.server.port);
    tracing::info!("Server starting: http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind address");

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("Server startup failed");
}
