#[derive(Debug)]
pub enum Cboe {
    BYX,
    BZX,
    EDGA,
    EDGX,
}

impl Cboe {
    pub fn to_string(&self) -> &'static str {
        match self {
            Cboe::BYX => "byx",
            Cboe::BZX => "bzx",
            Cboe::EDGA => "edga",
            Cboe::EDGX => "edgx",
        }
    }
}

#[derive(Debug)]
pub enum Nyse {
    Nyse,
    Arca,
    American,
    Texas,
    National,
}

#[derive(Debug)]
pub enum Nasdaq {
    Nasdaq,
    BX,
    PSX,
}

#[derive(Debug)]
pub enum Market {
    CBOE(Cboe),
    NYSE(Nyse),
    NASDAQ(Nasdaq),
    MEMX,
    MIAX,
    IEX,
    LTSE,
    X24X,
}
