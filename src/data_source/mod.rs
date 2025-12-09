use crate::{AppState, Error, ResponseResult};
use axum::{Json, extract::State};
use serde::{Serialize, de::DeserializeOwned};
use std::sync::Arc;

pub trait Source
where
    Self: DeserializeOwned + Send + Sync,
{
    type Output: Serialize;
    fn fetch(
        &self,
        client: &reqwest::Client,
    ) -> impl std::future::Future<Output = Result<Self::Output, anyhow::Error>> + Send;

    fn post(
        State(state): State<Arc<AppState>>,
        Json(payload): Json<Self>,
    ) -> impl std::future::Future<Output = ResponseResult<Json<Self::Output>>> + Send
    where
        Self: Sized,
    {
        async move {
            match payload.fetch(state.http_client()).await {
                Ok(result) => Ok(Json(result)),
                Err(err) => Err(Error::BadRequest(err)),
            }
        }
    }
}

pub mod book_view {
    pub mod cboe;
}

pub mod calendar {
    pub mod ipo {
        pub mod iposcoop;
    }
    pub mod economy {
        pub mod finviz;
    }
    pub mod spac {
        pub mod research;
    }
}

pub mod candlestick {
    pub mod finviz;
}

pub mod event {
    pub mod finviz;
}

pub mod quote {
    pub mod finviz;
    pub mod nasdaq;
}

pub mod screener {
    pub mod finviz;
}

pub mod translate {
    pub mod google;
}

pub mod time_stamp {
    pub mod akamai;
}
