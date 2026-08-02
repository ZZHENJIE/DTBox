import { useState, useCallback } from 'react'
import type { ApiResponse } from '~/types/api'
import { sendRequest } from '~/lib/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (config: { method: string; path: string; body?: unknown }) => Promise<T | null>
}

export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (config: { method: string; path: string; body?: unknown }): Promise<T | null> => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await sendRequest(config)
      if (res.status >= 200 && res.status < 300) {
        const json: ApiResponse<T> = JSON.parse(res.body)
        if (json.success && json.data !== undefined && json.data !== null) {
          setState({ data: json.data, loading: false, error: null })
          return json.data
        }
        setState({ data: null, loading: false, error: json.message || '操作失败' })
        return null
      }
      setState({ data: null, loading: false, error: `HTTP ${res.status}: ${res.statusText}` })
      return null
    } catch (err) {
      const msg = err instanceof Error ? err.message : '网络错误'
      setState({ data: null, loading: false, error: msg })
      return null
    }
  }, [])

  return { ...state, execute }
}
