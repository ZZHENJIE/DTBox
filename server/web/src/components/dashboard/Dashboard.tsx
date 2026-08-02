import { Activity } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="size-5" />
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-1">状态</p>
          <p className="text-2xl font-semibold text-green-600">已连接</p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-1">数据源</p>
          <p className="text-2xl font-semibold">-</p>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-1">待实现</p>
          <p className="text-2xl font-semibold text-muted-foreground">Finviz / Alpaca</p>
        </div>
      </div>
    </div>
  )
}
