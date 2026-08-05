import { useState, useCallback } from 'react'
import { TrendingUp } from 'lucide-react'
import { useApi } from '~/hooks/use-api'
import type { QuoteItem } from '~/types/api'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

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

export function FinvizStockPage() {
  const [symbol, setSymbol] = useState('')
  const [interval, setInterval] = useState('Day')
  const [range, setRange] = useState('Month')
  const { data, loading, error, execute } = useApi<QuoteItem[]>()

  const handleQuery = useCallback(() => {
    const trimmed = symbol.trim().toUpperCase()
    if (!trimmed) return
    execute({
      method: 'POST',
      path: '/api/finviz/stock',
      body: { symbol: trimmed, interval, valid_ranges: range },
    })
  }, [symbol, interval, range, execute])

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="size-5" />
        <h2 className="text-lg font-semibold">Finviz Stock</h2>
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
          {loading ? '查询中...' : '查询'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      {data && data.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead className="text-right">开盘</TableHead>
                <TableHead className="text-right">最高</TableHead>
                <TableHead className="text-right">最低</TableHead>
                <TableHead className="text-right">收盘</TableHead>
                <TableHead className="text-right">成交量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{item.Date}</TableCell>
                  <TableCell className="text-right font-mono">{item.Open.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{item.High.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{item.Low.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{item.Close.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{item.Volume.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">无数据</p>
      )}
    </div>
  )
}
