slint::include_modules!();

pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
    if let Ok(window) = MainWindow::new() {
        window.run()?
    }
    Ok(())
}
