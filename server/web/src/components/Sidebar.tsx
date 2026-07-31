import { cn } from '~/lib/utils'
import { endpoints } from '../lib/endpoints'
import type { EndpointDef } from '../lib/endpoints'

interface SidebarProps {
  selectedId: string
  onSelect: (ep: EndpointDef) => void
}

const categories = [...new Set(endpoints.map((e) => e.category))]

function methodClass(method: string) {
  switch (method) {
    case 'GET': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 'POST': return 'bg-green-500/10 text-green-600 dark:text-green-400'
    case 'PUT': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
    case 'DELETE': return 'bg-red-500/10 text-red-600 dark:text-red-400'
    default: return ''
  }
}

export function Sidebar({ selectedId, onSelect }: SidebarProps) {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-card border-r overflow-y-auto py-2">
      <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        API 接口
      </div>
      {categories.map((cat) => (
        <div key={cat} className="mb-1">
          <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            {cat}
          </div>
          {endpoints
            .filter((e) => e.category === cat)
            .map((ep) => (
              <button
                key={ep.id}
                onClick={() => onSelect(ep)}
                className={cn(
                  'flex items-center gap-2 w-full px-4 py-1.5 text-left text-xs transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedId === ep.id
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-muted-foreground'
                )}
              >
                <span className={cn('text-[9px] font-bold px-1 py-0.5 rounded min-w-[30px] text-center shrink-0', methodClass(ep.method))}>
                  {ep.method}
                </span>
                <span className="flex-1 truncate">{ep.label}</span>
                {ep.auth === 'access' && (
                  <span className="text-[8px] font-bold px-1 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">A</span>
                )}
                {ep.auth === 'refresh' && (
                  <span className="text-[8px] font-bold px-1 rounded bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 shrink-0">R</span>
                )}
                {ep.auth === 'admin' && (
                  <span className="text-[8px] font-bold px-1 rounded bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">AD</span>
                )}
              </button>
            ))}
        </div>
      ))}
    </aside>
  )
}
