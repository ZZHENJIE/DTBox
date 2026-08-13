import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { invoke } from "@tauri-apps/api/core"
import { isTauri } from '@tauri-apps/api/core'

const isTauriApp = isTauri();

const health = await fetch("/api/health");
const json = await health.json();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTauriApp ? <p>Tauri</p> : <p>Web</p>}
    <button onClick={async () => {
      await invoke("open_web_page", {
        webUrl: "https://bing.com",
        wsPort: 7890,
      })
    }}>Test</button>
    <p>{JSON.stringify(json)}</p>
  </StrictMode>,
)
