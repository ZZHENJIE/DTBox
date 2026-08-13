# DTBox Web

DTBox Web 前端，完整的单页应用（SPA），承载全部业务 UI。Web 仅在 Tauri 子窗口内运行，通过 Tauri IPC (`invoke`) 调用 Client 完成认证与 Token 获取。

## 核心设计原则

- **唯一 UI**：登录/注册、Dashboard、图表、Markdown 等全部页面都在 Web 端
- **认证由 Client 代理**：Web 不直接持有 RefreshToken，通过 `invoke("do_login")` 等命令交由 Client 完成登录；AccessToken 通过 `invoke` 获取和刷新
- **仅在 Tauri 子窗口运行**：依赖 `@tauri-apps/api` 的 IPC，浏览器中无法独立完成认证
- **同源 API 调用**：生产环境由 Server 自身 Serve 静态文件，API 请求为同源 `/api/xxx`，无需 CORS；开发环境通过 Vite proxy 代理
- **环境检测**：通过 `isTauri()` / `window.__TAURI_INTERNALS__` 判断是否运行在 Tauri WebView 中

## 认证流程

### 登录 / 注册

```
1. Web 子窗口加载，检测 Tauri 环境

2. 无有效 AccessToken 时显示登录/注册页

3. 用户提交表单 → invoke("do_login" / "do_register")
   Client 通过 HTTP 调用 Server，返回 user_id

4. 登录成功后 invoke("get_access_token") 获取 Token

5. 使用 access_token 调用 Server API
   携带 Authorization: Bearer header

6. access_token 过期时
   invoke("refresh_access_token") 获取新 Token
```

### 免密会话

```
Web 子窗口加载
  │
  ├─ invoke("get_access_token")
  │     │
  │     ├─ 返回有效 Token → 直接进入 Dashboard
  │     └─ 无 Token / 失败 → 进入登录页
```

## Tauri IPC 调用示例

```ts
import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@tauri-apps/api/core";

async function login(name: string, password: string) {
  return invoke<string>("do_login", { name, password });
}

async function getToken(): Promise<string> {
  if (!isTauri()) {
    throw new Error("Not running inside Tauri");
  }
  return invoke<string>("get_access_token");
}

async function refreshToken(): Promise<string> {
  return invoke<string>("refresh_access_token");
}
```

## 页面与路由

Web 基于 `react-router-dom` 组织路由，主要页面：

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录 / 注册 | 通过 IPC 调 Client 完成认证 |
| `/dashboard` | Dashboard | Finviz / Alpaca 数据看板 |
| `/chart` | K 线图 | lightweight-charts 渲染 |
| ... | 其他业务页面 | 股票搜索、财经日历、Markdown 文档等 |

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript |
| 路由 | react-router-dom |
| 构建 | Vite |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui（Radix UI 原语） |
| 图标 | Lucide React |
| 图表 | lightweight-charts |
| Markdown | markdown-to-jsx |
| 包管理 | Bun |
| HTTP 客户端 | fetch（封装于 `src/lib/api.ts`） |
| Tauri IPC | @tauri-apps/api（invoke） |

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

## 部署模型

| 环境 | API 调用方式 | 说明 |
|------|-------------|------|
| **开发** | `/api/xxx` → Vite proxy → 本地 Server | `vite.config.ts` 内置代理，无需 CORS |
| **生产（Tauri）** | 页面在 Tauri 子窗口加载，Token 通过 IPC 获取 | API 请求仍为同源 `/api/xxx`（Server 同源 Serve） |

开发服务器通过 Vite proxy 将 `/api` 请求代理到本地 Server 地址（目标地址按你的 Server 实际监听端口配置）。

## 前置依赖

- [Bun](https://bun.sh/)

## 开发

```bash
cd web
bun install
bun run dev
```

## 构建

```bash
bun run build
```

产物输出到 `web/dist`，由 Server（Axum）作为静态文件同源提供服务，API 请求 `/api/xxx` 无需跨域。
