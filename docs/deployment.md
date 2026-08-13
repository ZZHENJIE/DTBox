# 部署指南

## Server 部署

### 前置条件

- Rust（stable）
- SQLite（系统自带）
- Redis（可选，用于 Token 黑名单持久化）

### 编译与运行

```bash
cd server
cp config.example.toml config.toml
# 编辑 config.toml，至少设置 jwt.secret 为随机字符串
cargo build --release
./target/release/server --config config.toml
```

### 配置文件

`config.toml` 关键字段：

```toml
[server]
host = "0.0.0.0"       # 监听地址
port = 8080             # 监听端口
web_dir = ""            # 前端静态文件目录（生产环境指向 web/dist）

[jwt]
secret = "random-secret-please-change"
access_token_expire_minutes = 10
refresh_token_expire_days = 7

[data_source]
finviz_api_key = "your-finviz-api-key"

[data_source.alpaca]
api_key = "your-alpaca-api-key"
api_secret = "your-alpaca-api-secret"

[rate_limiter]
max_requests = 100
window_seconds = 60
```

配置文件路径必须显式指定，支持两种方式：

```bash
# 方式一：启动参数
./Server --config /etc/dtbox/config.toml

# 方式二：环境变量
DTBOX_CONFIG_PATH=/etc/dtbox/config.toml ./Server
```

优先级为启动参数 > 环境变量，两者都未提供时启动报错。

### HTTPS 反向代理

Server 本身仅监听 HTTP。生产环境应通过反向代理提供 HTTPS。

#### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/ssl/certs/example.com.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

#### Caddy

```
example.com {
    reverse_proxy 127.0.0.1:8080
}
```

### 部署 Web 前端

```bash
cd web
bun install
bun run build
```

构建产物输出到 `web/dist`。确保 `config.toml` 中 `web_dir` 指向该目录。

## Client 构建

### 前置条件

- [Rust](https://www.rust-lang.org/)（stable）
- [Bun](https://bun.sh/)
- [Tauri 系统依赖](https://v2.tauri.app/start/prerequisites/)
  - macOS：Xcode Command Line Tools
  - Linux：`libwebkit2gtk-4.1-dev` 等
  - Windows：WebView2

### 编译

```bash
cd client
bun install
cargo tauri build
```

构建产物：
- macOS：`.dmg` + `.app` 包
- Linux：`.deb` + `.rpm` 包 + `.AppImage`
- Windows：`.msi` + `.exe` 安装包

### CI/CD

项目已配置 GitHub Actions（`.github/workflows/client.yaml`），在推送到 `release` 分支时自动构建全平台产物并发布 GitHub Release。

## 数据库初始化

```bash
cd server/script
bun install
bun run update_stocks_table.ts
```

交互式提示输入 Finviz API Key 和数据库路径，自动拉取全量美股数据并写入 SQLite。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DTBOX_CONFIG_PATH` | 无（必填） | Server 配置文件路径 |
| `REDIS_URL` | 配置文件中读取 | Redis 连接地址 |
