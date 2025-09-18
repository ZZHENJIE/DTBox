import { MFetch } from "../utils/Tool";

async function Book_Viewer(symbol: string, market: string) {
    const url = `https://www.cboe.com/json/${market}/book/${symbol}`;
    return MFetch(url, {
        method: 'GET',
        headers: {
            referer: 'https://www.cboe.com/us/equities/market_statistics/book_viewer/'
        }
    }).then(response => response.json())
        .catch(error => error);
}

export default {
    Book_Viewer
}