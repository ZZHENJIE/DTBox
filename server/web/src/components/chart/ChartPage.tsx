import { LineChart } from 'lucide-react'

export function ChartPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <LineChart className="size-5" />
        <h2 className="text-lg font-semibold">Chart</h2>
      </div>
      <div className="border rounded-lg p-12 flex flex-col items-center justify-center gap-3 bg-card">
        <LineChart className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">图表功能待实现</p>
      </div>
    </div>
  )
}
