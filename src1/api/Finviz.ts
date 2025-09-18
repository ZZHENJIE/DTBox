import Tool, { MFetch } from "../utils/Tool";
import { type FinvizScreenerItem, type FinvizCandlestickParams } from './Type'
async function Export_Screener(parameter: string, token: string) {
    const VolumeFormat = (volume: number): string => {
        if (volume >= 1000000) {
            return (volume / 1000000).toFixed(2) + 'M';
        } else if (volume >= 1000) {
            return (volume / 1000).toFixed(2) + 'K';
        } else {
            return volume.toString();
        }
    };
    const url = `https://elite.finviz.com/export.ashx?v=111&${parameter}&auth=${token}`;
    return MFetch(url, { method: 'GET' }).then(async response => {
        const CSV = await response.text();
        const Lines = CSV.split('\n');
        const Result: FinvizScreenerItem[] = [];
        for (let line = 1; line < Lines.length - 2; line++) {
            const items = Lines[line].split(',');
            Result.push({
                Symbol: items[1].replace(/"/g, ''),
                Company: items[2].replace(/"/g, ''),
                Sector: items[3].replace(/"/g, ''),
                Industry: items[4].replace(/"/g, ''),
                Country: items[5].replace(/"/g, ''),
                MarketCap: items[6].replace(/"/g, ''),
                PriceEarningsRatio: items[7].replace(/"/g, ''),
                Price: items[8].replace(/"/g, ''),
                Change: items[9].replace(/"/g, ''),
                Volume: VolumeFormat(parseInt(items[10]))
            })
        }
        return Result;
    });
}

async function Candlestick(params: FinvizCandlestickParams) {
    const url = Tool.Url_Params_Insert('https://api.finviz.com/api/quote.ashx', params);
    return MFetch(url, { method: 'GET' })
        .then(response => response.json())
        .catch(error => error);
}

const FinvizThumbnails = {
    D: 'd',
    I1: 'i1',
    I3: 'i3',
    I5: 'i5',
} as const;

export type ThumbnailType = typeof FinvizThumbnails[keyof typeof FinvizThumbnails];

type ThumbnailDimensions = {
    width: number;
    height: number;
};

const ThumbnailDimensions: Record<ThumbnailType, ThumbnailDimensions> = {
    [FinvizThumbnails.D]: { width: 324, height: 180 },
    [FinvizThumbnails.I1]: { width: 844, height: 180 },
    [FinvizThumbnails.I3]: { width: 584, height: 180 },
    [FinvizThumbnails.I5]: { width: 376, height: 180 },
};

function Thumbnail_Image_Url(symbol: string, theme: 'd' | 'l' = 'd', type: ThumbnailType = FinvizThumbnails.D) {
    return `https://charts-node.finviz.com/chart.ashx?&t=${symbol}&tf=${type}&ct=candle_stick&tm=${theme}`;
}

function Get_Thumbnail_Image_Dimensions(type: ThumbnailType) {
    return ThumbnailDimensions[type];
}

export default {
    Export_Screener,
    Candlestick,
    Thumbnail_Image_Url,
    Get_Thumbnail_Image_Dimensions,
    FinvizThumbnails,
}