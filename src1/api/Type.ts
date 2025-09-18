export interface IPOItem {
    Symbol: string,
    Company: string,
    Managers: string,
    Shares_Millions: string,
    Price: string,
    Estimated_Dollar_Volume: string,
    Estimated_Date: string,
};

export type SpacResearchEvent = 'amendment-vote' | 'approval-vote' | 'ipo-date' | 'liq-deadline';
export interface SpacResearchItem {
    Date: string,
    Event: SpacResearchEvent,
    Symbol: string
};

export interface FinvizScreenerItem {
    Symbol: string,
    Company: string,
    Sector: string,
    Industry: string,
    Country: string,
    MarketCap: string,
    PriceEarningsRatio: string,
    Price: string,
    Change: string,
    Volume: string,
};

export interface FinvizCandlestickParams {
    Aftermarket?: boolean,
    BarsCount: number,
    Instrument: 'stock',
    Premarket?: boolean,
    Symbol: string,
    Timeframe: 'd' | 'i1',
};