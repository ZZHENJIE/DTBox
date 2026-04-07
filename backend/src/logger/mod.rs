use std::path::PathBuf;
use tracing_subscriber::{
    EnvFilter,
    fmt::{self, format::FmtSpan},
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

/// Initialize logging system
pub fn init_logging(log_dir: &PathBuf, level: &str) -> anyhow::Result<impl Drop> {
    std::fs::create_dir_all(log_dir)?;

    // File appender
    let file_appender = tracing_appender::rolling::daily(log_dir, "dtbox.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    // Environment filter
    let filter = EnvFilter::try_new(format!("dtbox={},tower_http=debug", level))
        .unwrap_or_else(|_| EnvFilter::new("info"));

    // Format layer
    let fmt_layer = fmt::layer()
        .with_span_events(FmtSpan::CLOSE)
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true);

    // File layer
    let file_layer = fmt::layer()
        .with_writer(non_blocking)
        .with_ansi(false)
        .with_span_events(FmtSpan::CLOSE);

    // Initialize
    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .with(file_layer)
        .init();

    tracing::info!("Logging initialized at level: {}", level);

    Ok(guard)
}
