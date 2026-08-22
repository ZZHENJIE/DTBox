# Web（前端页面）

> 本文档与 [`web/README.md`](../web/README.md) 保持 1:1 同步，Web 为完整 SPA，仅在 Tauri 子窗口内运行。

DTBox Web 前端，完整的单页应用（SPA），承载全部业务 UI。Web 仅在 Tauri 子窗口内运行，通过 Tauri IPC (`invoke`) 调用 Client 完成认证与 Token 获取。

## 核心设计原则

- **唯一 UI**：登录/注册、筛选器、报价、财经日历、设置等全部页面都在 Web 端
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
| `/screener` | 筛选器 | Finviz 筛选器数据表格，点击 Symbol 弹出 K 线对话框（上一项/下一项/报价） |
| `/quote` | 报价 | `?symbol=` 指定股票，K 线图 + 相关新闻 |
| `/calendar/:type` | 财经日历 | `ipo`/`spac` 仅 Benzinga；`economics`/`earnings` 支持 Finviz(默认)/Benzinga 双源切换，时间统一由 UTC `timestamp` 转本地 `YYYY-MM-DD HH:mm` 展示，所有 Symbol 列可点击跳转 `/quote?symbol=` |
| `/settings` | 设置 | 默认图表、筛选器预设、TimeWindow、语言 |
| `/admin` | 管理员 | 用户管理（角色修改、筛选器预设编辑），仅管理员可见 |
| `/tools/test` | 测试页面 | 占位测试页 |
| `/tools/timewindow` | 时间窗口 | 独立页面（无全局 Header），网络时间戳悬浮时钟 |

> 未匹配路由重定向到 `/screener`。

### 财经日历数据源说明

- `ipo`/`spac`：`POST /api/benzinga/calendar/ipo`（`page_size`+`date_from/to`+`ipo_type`），表头 `Symbol/Name/Date/Exchange/Type`，Symbol 可点击跳报价。
- `economics`：双源 `Tabs` 切换（默认 `finviz`）
  - `Benzinga`：`POST /api/benzinga/calendar/economics`（`timestamp: i64` UTC 替代旧 `date`/`time` 字符串；前端以 `timestamp` 转本地日期/时间，`0` 时回退）→ 列 `Date/Time/Event/Country/Importance/Consensus/Actual`
  - `Finviz`：`POST /api/finviz/calendar/economics`（无 `page_size`，仅 `date_from/to`；返回 `Timestamp/Event/Impact/For/Actual/Expected/Prior`）→ 列 `Date/Time/Event/Impact/For/Actual/Expected/Prior`
- `earnings`：双源 `Tabs` 切换（默认 `finviz`）
  - `Benzinga`：`POST /api/benzinga/calendar/earnings`（仍为 `date`/`time` 字符串）→ 列 `Symbol/Name/Date/Time/EPS/EPS Est./Revenue`
  - `Finviz`：`POST /api/finviz/calendar/earnings`（`Timestamp/Ticker/Company/Market Cap/EPS Estimate/Actual...`）→ 列 `Date/Time/Symbol/Name/Market Cap/EPS Est./EPS Act./Revenue Est./Revenue Act.`
- 类型分离：`src/types/data.ts` 中 `BenzingaEconomicsItem/EarningsItem` 与 `FinvizEconomicsItem/EarningsItem` 完全分离（Finviz 返回 PascalCase/带空格键名）；`src/lib/endpoints.ts` 新增 `finvizEconomics`/`finvizEarnings`。
- 表头统一：全站表格 `Ticker` 已统一为 `Symbol`（`i18n calendar.code` / `screener.symbol`）。

## 国际化 (i18n)

基于 `react-i18next` + `i18next`，支持 `en-US`（默认）与 `zh-CN`：

- 语言文件位于 `src/i18n/locales/`，初始化于 `src/i18n/index.ts`
- 语言偏好存储在用户 `settings.language`（后端），并在 `localStorage["dtbox.language"]` 缓存一份，使登录页也能跟随上次语言
- `src/components/LanguageSync.tsx` 负责将用户设置同步到 i18next 与 `<html lang>`
- 切换入口在设置页「语言」下拉

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
| 国际化 | i18next + react-i18next |
| 包管理 | Bun |
| HTTP 客户端 | fetch（封装于 `src/lib/api.ts`） |
| Tauri IPC | @tauri-apps/api（invoke） |

## 目录结构

```
web/
├── index.html
├── package.json
├── vite.config.ts          # Vite 配置，dev 代理 /api → Server
├── components.json         # shadcn/ui 配置
└── src/
    ├── main.tsx            # 入口（注入 i18n + AuthProvider + LanguageSync）
    ├── App.tsx             # 路由与布局
    ├── index.css           # Tailwind + shadcn/ui 变量
    ├── i18n/               # i18n 初始化与语言文件（en-US / zh-CN）
    ├── types/              # API 类型定义（对应 shared crate）
    ├── hooks/              # use-auth（认证上下文）
    ├── lib/                # API 客户端、端点定义、设置解析、工具函数
    └── components/
        ├── LanguageSync.tsx    # 语言同步
        ├── charts/             # KlineChart（lightweight-charts）
        ├── layout/             # AppLayout、Header、ProfileDialog、ChangelogDialog
        ├── pages/              # 业务页面
        ├── screener/           # 筛选器预设对话框（复用）
        └── ui/                 # shadcn/ui 基础组件
```

## 部署模型

| 环境 | API 调用方式 | 说明 |
|------|-------------|------|
| **开发** | `/api/xxx` → Vite proxy → Server | `vite.config.ts` 内置代理，无需 CORS |
| **生产（Tauri）** | 页面在 Tauri 子窗口加载，Token 通过 IPC 获取 | API 请求仍为同源 `/api/xxx`（Server 同源 Serve） |

开发服务器通过 Vite proxy 将 `/api` 请求代理到 Server 地址（目标地址按你的 Server 实际监听地址配置）。

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

## Lint / 类型检查

```bash
bun run lint
bunx tsc -b
```
