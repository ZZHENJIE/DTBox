import { useState, useCallback, useEffect, useRef } from 'react'
import { LineChart } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { sendRequest } from '~/lib/api'
import type { QuoteItem } from '~/types/api'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { KlineChart } from './KlineChart'

const INTERVALS = [
  { value: 'Minute', label: '1分' },
  { value: 'Minutes2', label: '2分' },
  { value: 'Minutes3', label: '3分' },
  { value: 'Minutes5', label: '5分' },
  { value: 'Minutes10', label: '10分' },
  { value: 'Minutes15', label: '15分' },
  { value: 'Minutes30', label: '30分' },
  { value: 'Hour', label: '1时' },
  { value: 'Hour2', label: '2时' },
  { value: 'Hour4', label: '4时' },
  { value: 'Day', label: '日' },
  { value: 'Week', label: '周' },
  { value: 'Month', label: '月' },
]

const RANGES = [
  { value: 'Day', label: '1天' },
  { value: 'Day5', label: '5天' },
  { value: 'Month', label: '1月' },
  { value: 'Month3', label: '3月' },
  { value: 'Month6', label: '6月' },
  { value: 'YearToDate', label: '年初至今' },
  { value: 'Year', label: '1年' },
  { value: 'Year2', label: '2年' },
  { value: 'Year5', label: '5年' },
  { value: 'Max', label: '全部' },
]

const selectStyle =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export function ChartPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSymbol = (searchParams.get('symbol') || '').toUpperCase()

  const [interval, setInterval] = useState('Day')
  const [range, setRange] = useState('Month')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chartData, setChartData] = useState<QuoteItem[] | null>(null)

  const doQueryRef = useRef(async (sym: string, int: string, rng: string) => {
    setError('')
    setChartData(null)
    setLoading(true)
    try {
      const res = await sendRequest({
        method: 'POST',
        path: '/api/finviz/stock',
        body: { symbol: sym, interval: int, valid_ranges: rng },
      })

      if (res.status >= 200 && res.status < 300) {
        const json = JSON.parse(res.body)
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setChartData(json.data as QuoteItem[])
        } else {
          setError('无数据')
        }
      } else {
        setError(`HTTP ${res.status}: ${res.statusText}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
    } finally {
      setLoading(false)
    }
  })

  const doQuery = useCallback((sym: string, int: string, rng: string) => {
    doQueryRef.current(sym, int, rng)
  }, [])

  useEffect(() => {
    if (urlSymbol) {
      doQuery(urlSymbol, interval, range)
    }
  }, [urlSymbol, interval, range, doQuery])

  const handleSymbolChange = useCallback((newSymbol: string) => {
    setSearchParams({ symbol: newSymbol })
  }, [setSearchParams])

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <LineChart className="size-5" />
        <h2 className="text-lg font-semibold">K线图</h2>
      </div>

      <div className="flex items-end gap-3 mb-6 flex-wrap">
        {urlSymbol ? (
          <Badge variant="secondary" className="h-9 px-3 font-mono text-sm">
            {urlSymbol}
          </Badge>
        ) : (
          <div className="text-sm text-muted-foreground self-center">输入股票代码查看K线图</div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="interval">周期</Label>
          <select
            id="interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className={selectStyle}
          >
            {INTERVALS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="range">范围</Label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className={selectStyle}
          >
            {RANGES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {!urlSymbol && (
          <Button onClick={() => {}} disabled className="opacity-50">
            查询
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      {chartData ? (
        <KlineChart data={chartData} symbol={urlSymbol} onSymbolClick={handleSymbolChange} />
      ) : !loading && !error ? (
        <div className="border rounded-lg h-125 flex flex-col items-center justify-center gap-3 bg-card">
          <LineChart className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">输入股票代码查看K线图</p>
        </div>
      ) : null}
    </div>
  )
}
