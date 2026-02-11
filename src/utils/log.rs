use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::{Layer, Registry, layer::SubscriberExt, util::SubscriberInitExt};

pub struct LogGuard {
    _guard: WorkerGuard,
}

pub fn log_system_init() -> anyhow::Result<LogGuard> {
    let file_appender = tracing_appender::rolling::daily("./logs", "DTBox.log");

    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    let env_filter = tracing_subscriber::EnvFilter::new("INFO")
        .add_directive("sea_orm=OFF".parse()?)
        .add_directive("sqlx=OFF".parse()?);

    let console_layer = tracing_subscriber::fmt::layer()
        .with_target(false)
        .with_filter(env_filter);

    let file_layer = tracing_subscriber::fmt::layer().with_writer(non_blocking);

    Registry::default()
        .with(console_layer)
        .with(file_layer)
        .init();

    Ok(LogGuard { _guard: guard })
}
