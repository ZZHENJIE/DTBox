import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RequestBuilder } from './components/RequestBuilder'
import { ResponseViewer } from './components/ResponseViewer'
import { setTokens } from './lib/api'
import { endpoints } from './lib/endpoints'
import type { EndpointDef } from './lib/endpoints'
import type { ResponseResult } from './lib/api'

export default function App() {
  const [selected, setSelected] = useState<EndpointDef>(endpoints[0])
  const [response, setResponse] = useState<ResponseResult | null>(null)
  const [, setTick] = useState(0)

  const forceUpdate = useCallback(() => setTick((t) => t + 1), [])

  const handleResponse = useCallback((res: ResponseResult) => {
    setResponse(res)

    if (selected.id === 'user_login') {
      try {
        const data = JSON.parse(res.body)
        if (data.success && data.data?.access_token && data.data?.refresh_token) {
          setTokens(data.data.access_token, data.data.refresh_token)
          forceUpdate()
        }
      } catch {
        // ignore
      }
    }
  }, [selected.id, forceUpdate])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        selectedEndpoint={selected}
        onSelectEndpoint={setSelected}
        onTokensChange={forceUpdate}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedId={selected.id} onSelect={setSelected} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <RequestBuilder
            key={selected.id}
            endpoint={selected}
            onResponse={handleResponse}
          />
          <ResponseViewer response={response} />
        </div>
      </div>
    </div>
  )
}
