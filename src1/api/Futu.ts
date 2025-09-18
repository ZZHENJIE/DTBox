import Tool, { MFetch } from '../utils/Tool';
import { Generate_Token } from '../utils/FutuQuoteToken'
import type { Language } from '../utils/Config.d';

async function Search(symbol: string) {
    const url = `https://www.futunn.com/search-stock/predict?keyword=${symbol}`;
    return MFetch(url, { method: 'GET' })
        .then(response => response.json())
        .catch(error => error);
}

async function Stock_Id_CSV() {
    const url = 'https://raw.githubusercontent.com/ZZHENJIE/FutuStockId/main/stock_id.csv';
    return MFetch(url, { method: 'GET' })
        .then(response => response.text())
        .catch(error => error);
}

async function Stock_News(stock_id: string, lang: Language = 'en-US') {
    const params = {
        stock_id: stock_id,
        market_type: 2,
        type: 0,
        subType: 0,
        lang: lang,
    };
    const url = Tool.Url_Params_Insert('https://www.futunn.com/quote-api/quote-v2/get-news-list', params);
    const token = Generate_Token(params);
    return MFetch(url, {
        method: 'GET',
        headers: {
            'quote-token': token,
        }
    }).then(response => response.json())
        .catch(error => error);
}

async function Financial_Calendar(timestamp: number) {
    const date = new Date(timestamp);
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const params = {
        beginDate: dateStr,
        market: 2,
        stockType: 0,
        from: 0,
        count: 20
    };
    const url = Tool.Url_Params_Insert('https://www.futunn.com/quote-api/quote-v2/get-financial-list', params);
    const token = Generate_Token(params);
    return MFetch(url, {
        method: 'GET',
        headers: {
            'quote-token': token,
        }
    }).then(response => response.json())
        .catch(error => error);
}

async function Flash_News(lang: Language = 'en-US') {
    const url = 'https://news.futunn.com/news-site-api/main/get-flash-list?pageSize=30';
    return MFetch(url, {
        method: 'GET',
        headers: {
            'Cookie': `locale=${lang};`
        }
    }).then(response => response.json())
        .catch(error => error);
}

export default {
    Search,
    Stock_News,
    Financial_Calendar,
    Flash_News,
    Stock_Id_CSV
}