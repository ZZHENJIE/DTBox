use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize)]
pub enum Cboe {
    BYX,
    BZX,
    EDGA,
    EDGX,
}

impl Default for Cboe {
    fn default() -> Self {
        Cboe::EDGA
    }
}

impl fmt::Display for Cboe {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Cboe::BYX => "byx",
            Cboe::BZX => "bzx",
            Cboe::EDGA => "edga",
            Cboe::EDGX => "edgx",
        })
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
