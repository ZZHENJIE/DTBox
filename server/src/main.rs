use std::time::Duration;

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
use tower_http::cors::{Any, CorsLayer};
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

    let state = AppState {
        db,
        config: config.clone(),
    };

    let rate_limiter = RateLimiter::new(&config);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .max_age(Duration::from_secs(3600));

    let user_routes = Router::new()
        .route("/check", get(user::check_user))
        .route("/create", post(user::create_user))
        .route("/login", post(user::login))
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
        .nest("/api/user", user_routes)
        .nest("/api/admin", admin_routes)
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .layer(RequestBodyLimitLayer::new(10 * 1024 * 1024))
        .layer(middleware::from_fn_with_state(
            rate_limiter.clone(),
            rate_limit::rate_limit,
        ))
        .with_state(state);

    let addr = format!("{}:{}", config.server.host, config.server.port);
    tracing::info!("Server starting: http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind address");

    axum::serve(listener, app)
        .await
        .expect("Server startup failed");
}
