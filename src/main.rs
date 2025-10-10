#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dt_box::run().await
}
