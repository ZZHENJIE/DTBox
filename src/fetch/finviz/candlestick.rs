use crate::RequestResult;

pub enum Timeframe {
    I1,
    I5,
    I15,
    I30,
    H1,
    D,
    W,
    M,
}

impl Timeframe {
    fn to_string(&self) -> &'static str {
        match self {
            Timeframe::I1 => "i1",
            Timeframe::I5 => "i5",
            Timeframe::I15 => "i15",
            Timeframe::I30 => "i30",
            Timeframe::H1 => "h1",
            Timeframe::D => "d",
            Timeframe::W => "w",
            Timeframe::M => "m",
        }
    }
}

pub enum Instrument {
    Stock,
}

impl Instrument {
    fn to_string(&self) -> &'static str {
        match self {
            Instrument::Stock => "stock",
        }
    }
}
pub struct Parameters {
    pub aftermarket: u32,
    pub date_from: u64,
    pub instrument: Instrument,
    pub premarket: u32,
    pub symbol: String,
    pub timeframe: Timeframe,
    pub events: bool,
}

impl Parameters {
    pub fn new(symbol: &str, date_from: u64) -> Self {
        Self {
            aftermarket: 1200,
            date_from,
            instrument: Instrument::Stock,
            premarket: 240,
            symbol: symbol.to_string(),
            timeframe: Timeframe::I1,
            events: false,
        }
    }
}

// pub async fn Quote(
//     client: &reqwest::Client,
//     parameters: Parameters,
// ) -> Result<RequestResult, reqwest::Error> {
// }
