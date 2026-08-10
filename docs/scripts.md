# 脚本工具

`server/script/` 目录包含辅助脚本。

## 安装

```bash
cd server/script
bun install
```

## update_stocks_table.ts

一键更新 Server SQLite 数据库中的 `stocks` 表。

```bash
bun run update_stocks_table.ts
```

### 交互提示

| 提示 | 默认值 | 说明 |
|------|--------|------|
| Enter Finviz API Key | 预填充 | Finviz elite API key |
| Enter SQLite file path | `../data.db` | 数据库路径 |
| Enter mergeLogoData chunk size | `10` | 每批请求的股票数 |

### 数据流水线

```
1. Fetch   → Finviz 全量股票导出（No./Ticker/Company）
2. Merge   → Benzinga 获取 Logo URL（分块请求）
3. Download → 下载 PNG（6 并发），失败回退 ui-avatars.com
4. Write   → 清空 stocks 表，批量写入
```

### 注意事项

- 如果 Benzinga API 返回 Cloudflare 403，需设置代理：

  ```bash
  export HTTPS_PROXY="http://127.0.0.1:7890"
  ```
