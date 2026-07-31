import { getTokens, setTokens, clearTokens } from '../lib/api'
import { endpoints } from '../lib/endpoints'
import type { EndpointDef } from '../lib/endpoints'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Circle } from 'lucide-react'

interface HeaderProps {
  selectedEndpoint: EndpointDef
  onSelectEndpoint: (ep: EndpointDef) => void
  onTokensChange: () => void
}

export function Header({ selectedEndpoint, onSelectEndpoint, onTokensChange }: HeaderProps) {
  const { accessToken, refreshToken } = getTokens()

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-card flex-shrink-0 gap-3 flex-wrap">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold whitespace-nowrap">DTBox API Test</h1>
        <Select
          className="h-7 text-xs w-[300px]"
          value={selectedEndpoint.id}
          onChange={(e) => {
            const ep = endpoints.find((x) => x.id === e.target.value)
            if (ep) onSelectEndpoint(ep)
          }}
        >
          {endpoints.map((ep) => (
            <option key={ep.id} value={ep.id}>
              [{ep.method}] {ep.path}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Circle className={`size-1.5 fill-current ${accessToken ? 'text-green-500' : 'text-muted-foreground/50'}`} />
          <span className="max-w-[140px] truncate">
            AT: {accessToken ? accessToken.slice(0, 12) + '...' : '未设置'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Circle className={`size-1.5 fill-current ${refreshToken ? 'text-green-500' : 'text-muted-foreground/50'}`} />
          <span className="max-w-[140px] truncate">
            RT: {refreshToken ? refreshToken.slice(0, 12) + '...' : '未设置'}
          </span>
        </div>
        <Input
          className="h-7 w-[170px] text-xs"
          placeholder="设置 AccessToken..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) {
                setTokens(val, getTokens().refreshToken || '')
                onTokensChange()
                ;(e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />
        <Input
          className="h-7 w-[170px] text-xs"
          placeholder="设置 RefreshToken..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) {
                setTokens(getTokens().accessToken || '', val)
                onTokensChange()
                ;(e.target as HTMLInputElement).value = ''
              }
            }
          }}
        />
        <Button size="sm" variant="outline" onClick={() => { clearTokens(); onTokensChange() }}>
          清除
        </Button>
      </div>
    </header>
  )
}
