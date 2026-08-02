import { useState, useEffect, useCallback } from 'react'
import type { InfoResult } from '~/types/api'
import { useApi } from './use-api'
import { getAccessToken, subscribe } from '~/lib/store'

export function useAuth() {
  const [user, setUser] = useState<InfoResult | null>(null)
  const [loading, setLoading] = useState(true)
  const { execute } = useApi<InfoResult>()

  const fetchUser = useCallback(async () => {
    setLoading(true)
    const data = await execute({ method: 'GET', path: '/api/user/me' })
    setUser(data)
    setLoading(false)
  }, [execute])

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      fetchUser()
    } else {
      setUser(null)
      setLoading(false)
    }

    const unsubscribe = subscribe(() => {
      const newToken = getAccessToken()
      if (newToken) {
        fetchUser()
      } else {
        setUser(null)
      }
    })

    return unsubscribe
  }, [fetchUser])

  const isAdmin = user?.role === 5

  return { user, loading, isAdmin, refetch: fetchUser }
}
