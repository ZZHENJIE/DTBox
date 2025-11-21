use std::sync::Arc;

pub async fn task(state: Arc<crate::AppState>) {
    let _ = state.settings().server.background_tasks_refresh;
    // loop {
    //     tokio::time::sleep(std::time::Duration::from_secs(refresh)).await;
    //     let time = crate::fetch::utils::time::akamai_stamper(state.http_client())
    //         .await
    //         .unwrap();
    //     println!("stocks task runing time :{}", time);
    // }
}
