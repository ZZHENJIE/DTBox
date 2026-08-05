import { useState, useCallback } from 'react'
import { LineChart } from 'lucide-react'
import { sendBlobRequest } from '~/lib/api'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

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
  const [symbol, setSymbol] = useState('')
  const [interval, setInterval] = useState('Day')
  const [range, setRange] = useState('Month')
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleQuery = useCallback(async () => {
    const trimmed = symbol.trim().toUpperCase()
    if (!trimmed) return

    setError('')
    setImgUrl(null)
    setLoading(true)
    try {
      const blob = await sendBlobRequest({
        method: 'POST',
        path: '/api/stock/kline_chart',
        body: { symbol: trimmed, interval, valid_ranges: range },
      })
      const url = URL.createObjectURL(blob)
      if (imgUrl) URL.revokeObjectURL(imgUrl)
      setImgUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }, [symbol, interval, range, imgUrl])

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <LineChart className="size-5" />
        <h2 className="text-lg font-semibold">K线图</h2>
      </div>

      <div className="flex items-end gap-3 mb-6 flex-wrap">
        <div className="space-y-1.5">
          <Label htmlFor="symbol">股票代码</Label>
          <Input
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleQuery() }}
            placeholder="AAPL"
            className="font-mono uppercase w-28"
          />
        </div>
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
        <Button onClick={handleQuery} disabled={loading || !symbol.trim()}>
          {loading ? '加载中...' : '查询'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      {imgUrl ? (
        <div className="border rounded-lg overflow-hidden bg-card p-4">
          <img src={imgUrl} alt={`${symbol} K线图`} className="w-full" />
        </div>
      ) : !loading && !error ? (
        <div className="border rounded-lg p-12 flex flex-col items-center justify-center gap-3 bg-card">
          <LineChart className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">输入股票代码查看K线图</p>
        </div>
      ) : null}
    </div>
  )
}
