import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken, getAuthState, setStoredWsPort, subscribe } from '~/lib/store'
import { ConnectingSpinner } from './ConnectingSpinner'

export function OpenPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const urlPort = new URLSearchParams(location.search).get('ws_port')
    if (urlPort) {
      setStoredWsPort(urlPort)
    }

    const currentState = getAuthState()
    if (currentState === 'authenticated' && getAccessToken()) {
      navigate('/', { replace: true })
      return
    }

    const unsubscribe = subscribe(() => {
      const state = getAuthState()
      if (state === 'authenticated' && getAccessToken()) {
        navigate('/', { replace: true })
      } else if (state === 'error') {
        setError('无法连接到 DTBox 客户端，请确保客户端已启动')
      }
    })

    const timeout = setTimeout(() => {
      if (getAuthState() !== 'authenticated') {
        setError('连接超时，请确认 DTBox 客户端已启动')
      }
    }, 10000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background px-4">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground">请从 DTBox 客户端重新打开此页面</p>
      </div>
    )
  }

  return <ConnectingSpinner message="正在连接 DTBox 客户端..." />
}
