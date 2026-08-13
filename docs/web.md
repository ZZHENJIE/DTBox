# Web（前端页面）

DTBox Web 前端，完整的单页应用（SPA），承载全部业务 UI。仅在 Tauri 子窗口内运行，通过 Tauri IPC (`invoke`) 完成认证与 Token 获取。

## 设计原则

- **唯一 UI**：登录/注册、Dashboard、图表、Markdown 等全部页面都在 Web 端
- **认证由 Client 代理**：Web 不持有 RefreshToken，通过 `invoke("do_login")` 等命令交由 Client 完成登录
- **仅在 Tauri 子窗口运行**：AccessToken 通过 IPC 获取，浏览器中无法独立完成认证
- **同源 API 调用**：生产环境 Server 自身 Serve 静态文件，API 为同源 `/api/xxx`
- **环境检测**：通过 `isTauri()` / `window.__TAURI_INTERNALS__` 判断运行环境

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript |
| 路由 | react-router-dom |
| 构建 | Vite |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui（Radix UI） |
| 图标 | Lucide React |
| 图表 | lightweight-charts |
| Markdown | markdown-to-jsx |
| 包管理 | Bun |

## 认证流程

```
1. Web 子窗口加载，检测 Tauri 环境

2. invoke("get_access_token") 尝试获取 Token
   ├─ 成功 → 直接进入 Dashboard
   └─ 失败 → 显示登录/注册页

3. 登录 → invoke("do_login" / "do_register")
   Client 通过 HTTP 调用 Server，返回 user_id

4. 使用 access_token 调用 Server API
   Authorization: Bearer <token>

5. token 过期时 invoke("refresh_access_token") 刷新
```

## 页面与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录 / 注册 | 通过 IPC 调 Client 完成认证 |
| `/dashboard` | Dashboard | Finviz / Alpaca 数据看板 |
| `/chart` | K 线图 | lightweight-charts 渲染 |
| ... | 其他业务页面 | 股票搜索、财经日历、Markdown 文档等 |

## 开发模式

```bash
cd web
bun install
bun run dev
```

开发服务器通过 Vite proxy 将 `/api` 请求代理到本地 Server 地址（目标地址按 Server 实际监听端口配置）。

### Vite 代理配置

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:<server-port>',
    },
  },
})
```

## 生产构建

```bash
bun run build
```

产物输出到 `web/dist`，由 Server（Axum）同源 Serve。

## 目录结构

```
web/
├── index.html
├── package.json
├── vite.config.ts          # Vite 配置，dev 代理 /api → 本地 Server
├── components.json         # shadcn/ui 配置
└── src/
    ├── main.tsx            # 入口（含 Tauri 环境检测）
    ├── App.tsx             # 路由与布局
    ├── index.css           # Tailwind + shadcn/ui 变量
    ├── types/              # API 类型定义（对应 shared crate）
    ├── lib/                # API 客户端、端点定义、工具函数
    └── components/         # 页面组件 + ui/ 基础组件
```
