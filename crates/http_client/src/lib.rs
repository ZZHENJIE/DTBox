use anyhow::anyhow;
use futures::{
    future::{self, BoxFuture},
    FutureExt,
};
use gpui_http_client::HttpClient as GPUIHttpClient;
use reqwest::Proxy;

pub struct HttpClient {
    client: reqwest::Client,
    proxy: Option<reqwest::Url>,
    user_agent: Option<reqwest::header::HeaderValue>,
}

impl HttpClient {
    pub fn new(proxy: Option<Proxy>, user_agent: Option<&str>) -> Self {
        let client = {
            let mut builder = reqwest::ClientBuilder::new();
            if let Some(proxy) = proxy {
                builder = builder.proxy(reqwest::Proxy::all(proxy).unwrap());
            }
            builder.build().unwrap()
        };
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
        self.send(gpui_http_client::Request::get(uri).body(body).unwrap())
    }
    fn post_json(
        &self,
        uri: &str,
        body: gpui_http_client::AsyncBody,
    ) -> BoxFuture<'static, anyhow::Result<gpui_http_client::Response<gpui_http_client::AsyncBody>>>
    {
        self.send(gpui_http_client::Request::post(uri).body(body).unwrap())
    }
    fn proxy(&self) -> Option<&reqwest::Url> {
        self.proxy.as_ref()
    }
    fn send(
        &self,
        req: gpui_http_client::http::Request<gpui_http_client::AsyncBody>,
    ) -> BoxFuture<'static, anyhow::Result<gpui_http_client::Response<gpui_http_client::AsyncBody>>>
    {
        Box::pin(async {
            Err(std::io::Error::new(
                std::io::ErrorKind::PermissionDenied,
                "BlockedHttpClient disallowed request",
            )
            .into())
        })
    }
    fn type_name(&self) -> &'static str {
        std::any::type_name::<Self>()
    }
    fn user_agent(&self) -> Option<&reqwest::header::HeaderValue> {
        self.user_agent.as_ref()
    }
}
