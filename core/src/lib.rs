pub mod cboe;
pub mod finviz {
    pub mod candlestick;
    pub mod news;
    pub mod screener;
}
pub mod nasdaq;
pub mod utils {
    pub mod language;
    pub mod time;
    pub mod translate;
}

#[derive(Debug)]
pub enum RequestResult<T> {
    Success(T),
    JsonError(String),
    ParseError(String),
}
