import type { ResponseResult } from '../lib/api'

interface ResponseViewerProps {
  response: ResponseResult | null
}

function formatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">点击「发送」按钮发起请求，响应将显示在这里</span>
      </div>
    )
  }

  const statusClass = response.status >= 200 && response.status < 300
    ? 'text-green-600 dark:text-green-400 font-semibold'
    : 'text-red-600 dark:text-red-400 font-semibold'

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex gap-5 mb-3 text-xs text-muted-foreground flex-wrap">
        <span>
          状态: <span className={statusClass}>{response.status} {response.statusText}</span>
        </span>
        <span>耗时: {response.timeMs}ms</span>
        <span>大小: {new Blob([response.body]).size.toLocaleString()} B</span>
      </div>

      <details className="mb-3 border rounded-md overflow-hidden">
        <summary className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground cursor-pointer bg-muted/40 hover:text-foreground select-none">
          Response Headers
        </summary>
        <div className="px-3 py-2 font-mono text-[11px] space-y-1">
          {Object.entries(response.headers).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-primary shrink-0">{key}:</span>
              <span className="text-muted-foreground break-all">{value}</span>
            </div>
          ))}
        </div>
      </details>

      <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">Response Body</div>
      <pre className="m-0 p-3 border rounded-md bg-muted/30 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all overflow-x-auto">
        {formatJson(response.body)}
      </pre>
    </div>
  )
}
