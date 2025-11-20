use std::sync::Arc;

pub struct AppState {
    settings: crate::Settings,
    database: sqlx::Pool<sqlx::Postgres>,
    http_client: Arc<reqwest::Client>,
}

impl AppState {
    pub async fn new(settings: crate::Settings) -> anyhow::Result<Self, anyhow::Error> {
        // create pg connect options
        let connectoptions = sqlx::postgres::PgConnectOptions::new()
            .host(&settings.postgres.host)
            .port(settings.postgres.port)
            .username(&settings.postgres.username)
            .password(&settings.postgres.password)
            .database("postgres");
        // create reqwest client
        let client_builder = {
            let username = settings.proxy.username.as_deref().unwrap_or("");
            let password = settings.proxy.password.as_deref().unwrap_or("");
            let mut builder = reqwest::ClientBuilder::new();
            // http proxy
            if let Some(url) = &settings.proxy.http {
                let proxy = reqwest::Proxy::http(url)?.basic_auth(username, password);
                builder = builder.proxy(proxy);
            }
            // https proxy
            if let Some(url) = &settings.proxy.https {
                let proxy = reqwest::Proxy::https(url)?.basic_auth(username, password);
                builder = builder.proxy(proxy);
            }
            builder
        };
        Ok(Self {
            database: Self::open_database(connectoptions).await?,
            http_client: Arc::new(client_builder.build()?),
            settings,
        })
    }
    pub async fn open_database(
        connectoptions: sqlx::postgres::PgConnectOptions,
    ) -> Result<sqlx::Pool<sqlx::Postgres>, sqlx::Error> {
        let pool = sqlx::PgPool::connect_with(connectoptions).await?;
        Ok(pool)
    }
    pub fn settings(&self) -> &crate::Settings {
        &self.settings
    }
    pub fn http_client(&self) -> &reqwest::Client {
        &self.http_client
    }
    pub fn database_pool(&self) -> &sqlx::Pool<sqlx::Postgres> {
        &self.database
    }
}
