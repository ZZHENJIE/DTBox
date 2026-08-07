import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData } from 'lightweight-charts'
import type { QuoteItem } from '~/types/api'

interface KlineChartProps {
  data: QuoteItem[]
  symbol?: string
  height?: number
  onSymbolClick?: (symbol: string) => void
}

const chartColors = {
  background: '#000000',
  text: '#a1a1aa',
  grid: '#27272a',
  border: '#27272a',
  candleUp: '#22c55e',
  candleDown: '#ef4444',
}

function parseFinvizTime(dateStr: string): number | string {
  const parts = dateStr.trim().split(/\s+/)
  const [month, day, year] = parts[0].split('/').map(Number)

  if (parts.length >= 3) {
    const [timePart, ampm] = parts.slice(1)
    const [hourStr, minuteStr] = timePart.split(':')
    let h = Number(hourStr)
    const m = Number(minuteStr)
    if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0
    return Date.UTC(year, month - 1, day, h, m) / 1000
  }

  const y = year.toString().padStart(4, '0')
  const m = month.toString().padStart(2, '0')
  const d = day.toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toCandlestickData(items: QuoteItem[]) {
  return items
    .map((item) => ({
      time: parseFinvizTime(item.Date),
      open: item.Open,
      high: item.High,
      low: item.Low,
      close: item.Close,
    }))
    .sort((a, b) => (a.time < b.time ? -1 : 1))
}

function toVolumeData(items: QuoteItem[]) {
  return items
    .map((item) => {
      const color = item.Close >= item.Open ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'
      return {
        time: parseFinvizTime(item.Date),
        value: item.Volume,
        color,
      }
    })
    .sort((a, b) => (a.time < b.time ? -1 : 1))
}

function formatIntradayTime(timestamp: number): string {
  const d = new Date(timestamp * 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export function KlineChart({ data, symbol, height = 500, onSymbolClick }: KlineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<{
    chart: IChartApi
    candleSeries: ISeriesApi<'Candlestick'>
    volumeSeries: ISeriesApi<'Histogram'>
    legend: HTMLDivElement
    isIntraday: boolean
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || data.length === 0) return

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.text,
      },
      grid: {
        vertLines: { color: chartColors.grid },
        horzLines: { color: chartColors.grid },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: chartColors.border },
      timeScale: { borderColor: chartColors.border },
      handleScroll: { vertTouchDrag: false },
    })

    const logoLink = container.querySelector<HTMLAnchorElement>('a')
    if (logoLink) {
      logoLink.textContent = symbol || 'DTBox'
      logoLink.removeAttribute('href')
      logoLink.style.color = chartColors.text
      logoLink.style.fontWeight = '600'
      logoLink.style.cursor = symbol ? 'pointer' : 'default'
      if (symbol && onSymbolClick) {
        logoLink.onclick = (e) => {
          e.preventDefault()
          onSymbolClick(symbol)
        }
      }
    }

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: chartColors.candleUp,
      downColor: chartColors.candleDown,
      borderUpColor: chartColors.candleUp,
      borderDownColor: chartColors.candleDown,
      wickUpColor: chartColors.text,
      wickDownColor: chartColors.text,
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    volumeSeries.priceScale().applyOptions({ visible: false })

    const legend = document.createElement('div')
    legend.style.cssText = `
      position: absolute; top: 8px; left: 8px; z-index: 10;
      background: rgba(24,24,27,0.9); color: #a1a1aa;
      font-family: monospace; font-size: 12px; line-height: 1.6;
      padding: 8px 12px; border-radius: 6px;
      pointer-events: none; display: none;
    `
    container.style.position = 'relative'
    container.appendChild(legend)

    const candleData = toCandlestickData(data)
    const volumeData = toVolumeData(data)
    const isIntraday = candleData.length > 0 && typeof candleData[0].time === 'number'

    candleSeries.setData(candleData as never)
    volumeSeries.setData(volumeData as never)
    chart.timeScale().fitContent()
    chart.timeScale().applyOptions({ timeVisible: isIntraday })

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || param.point === undefined) {
        legend.style.display = 'none'
        return
      }
      const cd = param.seriesData.get(candleSeries) as CandlestickData | undefined
      const vd = param.seriesData.get(volumeSeries) as HistogramData | undefined
      if (!cd) {
        legend.style.display = 'none'
        return
      }
      const timeStr = isIntraday ? formatIntradayTime(cd.time as number) : String(cd.time)
      const vol = vd ? vd.value.toLocaleString() : '-'
      legend.innerHTML = `
        <div style="color:#e4e4e7;margin-bottom:4px">${timeStr}</div>
        <div>开: <span style="color:#e4e4e7">${cd.open.toFixed(2)}</span></div>
        <div>高: <span style="color:#e4e4e7">${cd.high.toFixed(2)}</span></div>
        <div>低: <span style="color:#e4e4e7">${cd.low.toFixed(2)}</span></div>
        <div>收: <span style="color:#${cd.close >= cd.open ? '22c55e' : 'ef4444'}">${cd.close.toFixed(2)}</span></div>
        <div>量: <span style="color:#e4e4e7">${vol}</span></div>
      `
      legend.style.display = 'block'
    })

    chartRef.current = { chart, candleSeries, volumeSeries, legend, isIntraday }

    return () => {
      chart.remove()
      legend.remove()
      chartRef.current = null
    }
  }, [data, symbol, onSymbolClick])

  return (
    <div
      ref={containerRef}
      className="border rounded-lg overflow-hidden"
      style={{ height }}
    />
  )
}
