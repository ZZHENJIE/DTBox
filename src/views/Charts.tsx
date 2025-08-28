import { AreaSeries, CandlestickSeries, ColorType, createChart, createTextWatermark, LineSeries, type ChartOptions, type CreatePriceLineOptions, type DeepPartial } from 'lightweight-charts';
import { NFlex } from 'naive-ui';
import { defineComponent, h, onMounted, ref } from 'vue';

const volume_data = [
    { time: '2018-12-22', value: 32.51 },
    { time: '2018-12-23', value: 31.11 },
    { time: '2018-12-24', value: 27.02 },
    { time: '2018-12-25', value: 27.32 },
    { time: '2018-12-26', value: 25.17 },
    { time: '2018-12-27', value: 28.89 },
    { time: '2018-12-28', value: 25.46 },
    { time: '2018-12-29', value: 23.92 },
    { time: '2018-12-30', value: 22.68 },
    { time: '2018-12-31', value: 22.67 },
];

const candlestick_data = [
    { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
    { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
    { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
    { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
    { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
    { time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
    { time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
    { time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
    { time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
];

const series_data = () => {
    const result = [];
    for (const item of candlestick_data) {
        result.push({
            time: item.time,
            value: item.close
        });
    }
    return result;
}

export default defineComponent(() => {

    const chart_container = ref<HTMLElement | null>(null);

    onMounted(() => {
        if (chart_container.value) {
            const chartOptions: DeepPartial<ChartOptions> = {
                layout: {
                    textColor: 'white',
                    background: {
                        type: ColorType.Solid,
                        color: 'black'
                    }
                },
                autoSize: true
            };
            const chart = createChart(chart_container.value, chartOptions);
            createTextWatermark(chart.panes()[0], {
                horzAlign: 'center',
                vertAlign: 'center',
                lines: [
                    {
                        text: 'DTBox',
                        color: 'rgba(171, 71, 188, 0.5)',
                        fontSize: 24,
                    },
                ],
            });
            const areaSeries = chart.addSeries(AreaSeries, {
                lineColor: '#2962FF', topColor: '#2962FF',
                bottomColor: 'rgba(41, 98, 255, 0.28)',
            });
            areaSeries.setData(volume_data);

            const series = chart.addSeries(LineSeries, { color: '#2962FF' });
            series.setData(series_data());

            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
                wickUpColor: '#26a69a', wickDownColor: '#ef5350', priceLineVisible: false, lastValueVisible: false,
            });

            const lineWidth = 2;
            const minPriceLine: CreatePriceLineOptions = {
                price: 80.91,
                color: '#ef5350',
                lineWidth: lineWidth,
                lineStyle: 2, // LineStyle.Dashed
                axisLabelVisible: true,
                title: 'min price',
            };
            candlestickSeries.createPriceLine(minPriceLine);
            candlestickSeries.setData(candlestick_data);

            chart.timeScale().fitContent();
        }
    })

    const chart_div = () => h('div', {
        style: {
            height: '600px',
            'z-index': 0
        },
        ref: chart_container
    });

    const render = () => h(NFlex, {
        vertical: true
    }, () => [chart_div()])

    return render;
});