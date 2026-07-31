import { useState, useCallback } from 'react'
import { sendRequest, getTokens } from '../lib/api'
import type { EndpointDef } from '../lib/endpoints'
import type { ResponseResult } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Send } from 'lucide-react'

interface RequestBuilderProps {
  endpoint: EndpointDef
  onResponse: (res: ResponseResult) => void
}

function methodBadgeClass(method: string) {
  return method === 'GET'
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    : 'bg-green-500/10 text-green-600 dark:text-green-400'
}

export function RequestBuilder({ endpoint, onResponse }: RequestBuilderProps) {
  const [path, setPath] = useState(endpoint.path)
  const [body, setBody] = useState(endpoint.defaultBody || '')
  const [loading, setLoading] = useState(false)

  const handleSend = useCallback(async () => {
    setLoading(true)
    try {
      let finalPath = path
      let finalBody: unknown = undefined

      if (body.trim()) {
        try {
          finalBody = JSON.parse(body)
        } catch {
          finalBody = body
        }
      }

      const res = await sendRequest({
        method: endpoint.method,
        path: finalPath,
        body: endpoint.method !== 'GET' ? finalBody : undefined,
      })

      onResponse(res)
    } catch (err) {
      onResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: err instanceof Error ? err.message : String(err),
        timeMs: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [path, body, endpoint.method, onResponse])

  const { accessToken, refreshToken } = getTokens()

  return (
    <div className="p-4 border-b flex-shrink-0">
      <div className="text-xs text-muted-foreground mb-3">{endpoint.description}</div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded min-w-[44px] text-center shrink-0 ${methodBadgeClass(endpoint.method)}`}>
          {endpoint.method}
        </span>
        <Input
          className="flex-1 h-8 text-sm font-mono"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/api/..."
        />
        <Button size="sm" onClick={handleSend} disabled={loading} className="gap-1.5">
          <Send className="size-3.5" />
          {loading ? '发送中...' : '发送'}
        </Button>
      </div>

      <details className="mb-2 border rounded-md overflow-hidden" open>
        <summary className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground cursor-pointer bg-muted/40 hover:text-foreground select-none">
          Headers
        </summary>
        <div className="px-3 py-2 font-mono text-[11px] space-y-1">
          <div className="flex gap-2">
            <span className="text-primary shrink-0">Content-Type:</span>
            <span className="text-muted-foreground">application/json</span>
          </div>
          {accessToken && (
            <div className="flex gap-2">
              <span className="text-primary shrink-0">Authorization:</span>
              <span className="text-muted-foreground break-all">Bearer {accessToken.slice(0, 20)}...</span>
            </div>
          )}
          {refreshToken && (
            <div className="flex gap-2">
              <span className="text-primary shrink-0">X-Refresh-Token:</span>
              <span className="text-muted-foreground break-all">{refreshToken.slice(0, 20)}...</span>
            </div>
          )}
        </div>
      </details>

      {(endpoint.method === 'POST' || endpoint.defaultBody) && (
        <details className="border rounded-md overflow-hidden" open>
          <summary className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground cursor-pointer bg-muted/40 hover:text-foreground select-none">
            Body
          </summary>
          <Textarea
            className="min-h-[140px] border-0 rounded-none font-mono text-xs leading-relaxed resize-y"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            spellCheck={false}
          />
        </details>
      )}
    </div>
  )
}
