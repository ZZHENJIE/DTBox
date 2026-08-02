# DTBox Web

DTBox Web 前端，由 Client（Tauri 桌面端）通过 `opener` 打开的 Web 页面，与 Client 本地 WebSocket 通信以获取短效 AccessToken。

## 核心设计原则

- **无登录页面**：用户不需要在 Web 端输入密码，认证由桌面端代为完成
- **唯一入口**：`/open?ws_port=<port>`，AccessToken 不通过 URL 传递，由 WebSocket 握手后获取
- **Token 由 Client 管理**：Web 端不持有 RefreshToken，AccessToken 通过 WebSocket 从 Client 获取和刷新
- **同源 API 调用**：生产环境由 Server 自身 Serve 静态文件，API 请求为同源 `/api/xxx`，无需 CORS；开发环境通过 Vite proxy 代理
- **UI 与 Client 统一**：与 Tauri 桌面端共享 shadcn/ui 组件库和 Tailwind 样式体系，保证两端视觉和交互一致

## 认证流程

```
         1. 页面加载  /open?ws_port=12345
            （URL 中无 AccessToken，无泄漏风险）

         2. 连接 WebSocket  ws://localhost:12345

         3. Client 主动推送当前 access_token

         4. 使用 access_token 调用 Server API
            携带 Authorization: Bearer header

         5. access_token 过期时
            通过 WebSocket 请求 Client 刷新
```

```
┌──────────┐    WS 连接 ws://localhost:<port>   ┌──────────┐
│   Web    │─── connect ───────────────────────►│  Client  │
│  页面     │◄── push access_token ─────────────│          │
│          │─── request refresh ───────────────►│          │
│          │◄── push new access_token ──────────│          │
└────┬─────┘                                    └──────────┘
     │
     │ HTTP (Bearer access_token)
     ▼
┌──────────┐
│  Server  │
└──────────┘
```

## UI 统一

Web 端与 Client（Tauri 桌面端）共享统一的设计体系：

- **同一组件库**：shadcn/ui（Radix UI 原语），两端使用相同的 Button、Input、Dialog 等组件
- **同一样式系统**：Tailwind CSS v4，共享颜色主题、间距比例、字体大小等设计令牌
- **交互模式统一**：表单校验规则、加载状态、Toast 提示等行为保持一致
- **类型定义对齐**：API 请求/响应类型与 `shared` Rust crate 定义一一对应（`server/web/src/types/api.ts`）

## 当前状态

目前是 Server API 的测试工具（类 Postman），包含：

- 侧边栏列出所有 API 端点，按认证类型分组（公开/需要 AccessToken/需要 RefreshToken/Admin 权限）
- 请求构造器（方法、路径、JSON Body 编辑）
- 响应查看器（状态码、时间、Headers、格式化 JSON）
- Token 管理栏（显示/手动设置 AccessToken、RefreshToken）

后续将改造为正式的 DTBox Web 前端。

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS v4 |
| 组件库 | shadcn/ui（Radix UI 原语） |
| 图标 | Lucide React |
| 包管理 | Bun |
| HTTP 客户端 | fetch（封装于 `src/lib/api.ts`） |

## 目录结构

```
server/web/
├── index.html
├── package.json
├── vite.config.ts          # Vite 配置，dev 代理 /api → localhost:8080
├── components.json         # shadcn/ui 配置
├── src/
│   ├── main.tsx            # 入口
│   ├── App.tsx             # 主布局
│   ├── index.css           # Tailwind + shadcn/ui 变量
│   ├── types/
│   │   └── api.ts          # API 类型定义（对应 shared crate）
│   ├── lib/
│   │   ├── api.ts          # HTTP 客户端，自动附加认证头
│   │   ├── endpoints.ts    # 端点定义
│   │   └── utils.ts        # Tailwind class 合并
│   └── components/
│       ├── Header.tsx      # Token 状态栏
│       ├── Sidebar.tsx     # 端点列表
│       ├── RequestBuilder.tsx # 请求表单
│       ├── ResponseViewer.tsx # 响应展示
│       └── ui/             # shadcn/ui 基础组件
```

## 部署模型

| 环境 | API 调用方式 | 说明 |
|------|-------------|------|
| **开发** | `/api/xxx` → Vite proxy → `localhost:8080` | `vite.config.ts` 内置代理，无需 CORS |
| **生产** | 同源 `/api/xxx` | Server 同时 Serve 前端静态文件（`server/dist`）和 API，同一域名，无跨域 |

## 前置依赖

- [Bun](https://bun.sh/)

## 开发

```bash
cd server/web
bun install
bun run dev
```

开发服务器默认运行在 `http://localhost:5173`，通过 Vite proxy 将 `/api` 请求代理到 `http://localhost:8080`。

## 构建

```bash
bun run build
```

产物输出到 `server/dist`，由 Server（Axum）作为静态文件同源提供服务，API 请求 `/api/xxx` 无需跨域。
