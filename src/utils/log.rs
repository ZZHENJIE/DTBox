use chrono::Local;
use std::{fs::File, path::Path};
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::{Layer, fmt, layer::SubscriberExt, util::SubscriberInitExt};

pub struct LogGuard {
    _guard: WorkerGuard,
}

pub fn log_system_init() -> anyhow::Result<LogGuard> {
    let log_dir = "logs";
    let log_file = format!("{}/{}.log", log_dir, Local::now().format("%Y-%m-%d"));

    if let Some(parent) = Path::new(&log_file).parent() {
        std::fs::create_dir_all(parent)?;
    }

    let file = File::create(&log_file)?;
    let (non_blocking, guard) = tracing_appender::non_blocking(file);

    let file_layer = fmt::layer().with_writer(non_blocking).boxed();

    tracing_subscriber::registry()
        .with(file_layer)
        .with(fmt::Layer::default())
        .init();

    Ok(LogGuard { _guard: guard })
}
