pub struct AppState {
    http_client: reqwest::Client,
    http_client_proxy: Option<reqwest::Proxy>,
    time_stamper: u64,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            http_client_proxy: None,
            http_client: reqwest::Client::new(),
            time_stamper: 0,
        }
    }
    pub async fn init_time_stamper(&mut self) {
        match request::utils::time::akamai_stamper(&self.http_client)
            .await
            .unwrap()
        {
            request::RequestResult::Success(time_stamper) => {
                self.time_stamper = time_stamper;
            }
            request::RequestResult::Error(err) => panic!("Failed to get time stamp: {}", err),
        };
    }
    pub fn set_http_client_proxy(
        &mut self,
        proxy: Option<reqwest::Proxy>,
    ) -> Result<bool, reqwest::Error> {
        if let Some(proxy) = proxy {
            let new_client = reqwest::ClientBuilder::new().proxy(proxy.clone()).build()?;
            self.http_client_proxy = Some(proxy);
            self.http_client = new_client;
            return Ok(true);
        }
        Ok(false)
    }
    pub fn http_client_proxy(&self) -> Option<&reqwest::Proxy> {
        self.http_client_proxy.as_ref()
    }
    pub fn http_client(&self) -> &reqwest::Client {
        &self.http_client
    }
}
