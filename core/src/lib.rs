pub mod cboe {
    pub mod market;
    pub mod symbol;
}
pub mod finviz {
    pub mod candlestick;
    pub mod news;
    pub mod screener;
}
pub mod market;
pub mod nasdaq;
pub mod utils {
    pub mod language;
    pub mod time;
    pub mod translate;
}

#[derive(Debug)]
pub enum RequestResult<T> {
    Success(T),
    Error(String),
}
