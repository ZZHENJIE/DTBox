# Web（前端页面）

DTBox Web 前端 SPA，由 Client（Tauri 桌面端）通过 `opener` 打开，通过本地 WebSocket 获取 AccessToken。

## 设计原则

- **无登录页面**：用户不在 Web 端输入密码，认证由桌面端代理
- **唯一入口**：`/open?ws_port=<port>`，AccessToken 不通过 URL 传递
- **Token 由 Client 管理**：Web 端不持有 RefreshToken，通过 WebSocket 获取和刷新
- **同源 API 调用**：生产环境 Server 自身 Serve 静态文件，API 为同源 `/api/xxx`
- **UI 统一**：与桌面端共享 shadcn/ui + Tailwind，视觉一致

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui（Radix UI） |
| 图标 | Lucide React |
| 包管理 | Bun |

## 认证流程

```
1. 页面加载 /open?ws_port=12345
   （URL 中无 AccessToken）

2. WebSocket 连接 ws://localhost:12345

3. Client 主动推送 access_token

4. 使用 access_token 调用 Server API
   Authorization: Bearer <token>

5. token 过期时，通过 WebSocket 请求 Client 刷新
```

## 开发模式

```bash
cd server/web
bun install
bun run dev
```

开发服务器运行在 `http://localhost:5173`，Vite 代理 `/api` 到 `http://localhost:8080`。

### Vite 代理配置

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
```

## 生产构建

```bash
bun run build
```

产物输出到 `server/dist`，由 Server（Axum）同源 Serve。

## 当前状态

目前是 API 调试工具，包含：
- 侧边栏：端点按认证类型分组（公开 / AccessToken / RefreshToken / Admin）
- 请求构造器：方法、路径、JSON Body
- 响应查看器：状态码、耗时、Headers、格式化 JSON
- Token 管理栏：手动设置 AccessToken / RefreshToken

## 目录结构

```
server/web/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css            # Tailwind + shadcn/ui 变量
│   ├── types/api.ts         # API 类型定义（对应 shared crate）
│   ├── lib/
│   │   ├── api.ts           # HTTP 客户端（自动 Bearer auth）
│   │   ├── endpoints.ts     # 端点定义
│   │   └── utils.ts         # 工具函数
│   └── components/
│       ├── Header.tsx       # Token 状态栏
│       ├── Sidebar.tsx      # 端点列表
│       ├── RequestBuilder.tsx
│       ├── ResponseViewer.tsx
│       └── ui/              # shadcn/ui 基础组件
```
