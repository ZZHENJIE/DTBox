import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { sendRequest } from '~/lib/api'
import type { StockItem, StockSearchResult } from '~/types/api'
import { Input } from '~/components/ui/input'

export function StockSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockItem[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim().toUpperCase()
    if (trimmed.length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    try {
      const res = await sendRequest({
        method: 'GET',
        path: `/api/stock/search?symbol=${encodeURIComponent(trimmed)}&limit=5`,
      })
      if (res.status >= 200 && res.status < 300) {
        const json = JSON.parse(res.body)
        if (json.success && json.data) {
          const data = json.data as StockSearchResult
          setResults(data.stocks)
          setOpen(data.stocks.length > 0)
          setActiveIdx(-1)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const handleInput = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }, [doSearch])

  const handleSelect = useCallback((symbol: string) => {
    setQuery('')
    setOpen(false)
    setResults([])
    navigate(`/chart?symbol=${symbol}`)
  }, [navigate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      handleSelect(results[activeIdx].symbol)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [open, results, activeIdx, handleSelect])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword) return text
    const idx = text.toUpperCase().indexOf(keyword.toUpperCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-medium">{text.slice(idx, idx + keyword.length)}</span>
        {text.slice(idx + keyword.length)}
      </>
    )
  }

  const trimmed = query.trim()

  return (
    <div ref={containerRef} className="relative w-64">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          className="h-8 pl-8 text-sm"
          placeholder="搜索股票..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
        />
      </div>
      {open && (
        <div className="absolute top-full mt-1 w-full border rounded-md bg-popover shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((item, i) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                i === activeIdx ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => handleSelect(item.symbol)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              {item.logo ? (
                <img src={item.logo} alt="" className="size-5 rounded-full object-cover shrink-0" />
              ) : (
                <div className="size-5 rounded-full bg-muted shrink-0" />
              )}
              <span className="font-mono font-medium">{highlightMatch(item.symbol, trimmed)}</span>
              <span className="text-muted-foreground ml-auto text-xs truncate">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
