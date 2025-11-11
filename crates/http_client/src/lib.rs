use futures::future::BoxFuture;
use gpui_http_client::HttpClient as GPUIHttpClient;

pub struct HttpClient {
    client: reqwest::Client,
    proxy: Option<reqwest::Url>,
    user_agent: Option<reqwest::header::HeaderValue>,
}

impl HttpClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            proxy: None,
            user_agent: Some(reqwest::header::HeaderValue::from_static(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            )),
        }
    }
}

impl GPUIHttpClient for HttpClient {
    fn get(
        &self,
        uri: &str,
        body: gpui_http_client::AsyncBody,
        follow_redirects: bool,
    ) -> BoxFuture<'static, anyhow::Result<gpui_http_client::Response<gpui_http_client::AsyncBody>>>
    {
        self.send(self.client.get(uri).body(body).build().unwrap())
    }
    fn post_json(
        &self,
        uri: &str,
        body: gpui_http_client::AsyncBody,
    ) -> BoxFuture<'static, anyhow::Result<gpui_http_client::Response<gpui_http_client::AsyncBody>>>
    {
        self.send()
    }
    fn proxy(&self) -> Option<&reqwest::Url> {
        self.proxy.as_ref()
    }
    fn send_multipart_form<'a>(
        &'a self,
        _url: &str,
        _request: reqwest::multipart::Form,
    ) -> BoxFuture<'a, anyhow::Result<gpui_http_client::Response<gpui_http_client::AsyncBody>>>
    {
        self.send()
    }
    fn send(
        &self,
        req: gpui_http_client::http::Request<gpui_http_client::AsyncBody>,
    ) -> BoxFuture<'static, anyhow::Result<gpui_http_client::Response<gpui_http_client::AsyncBody>>>
    {
    }
    fn type_name(&self) -> &'static str {
        std::any::type_name::<Self>()
    }
    fn user_agent(&self) -> Option<&reqwest::header::HeaderValue> {
        self.user_agent.as_ref()
    }
}
