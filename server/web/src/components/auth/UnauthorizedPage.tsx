import { WifiOff } from 'lucide-react'
import { Button } from '~/components/ui/button'

export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-background px-4">
      <WifiOff className="size-12 text-muted-foreground" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">未检测到 DTBox 客户端连接</h2>
        <p className="text-sm text-muted-foreground mt-2">
          请从 DTBox 桌面客户端打开此页面，或确认客户端已完成登录
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => { window.location.href = '/open' + window.location.search }}
      >
        重试连接
      </Button>
    </div>
  )
}
