# 第三方数据接口

需要 Subscriber 及以上角色 + AccessToken 认证的数据查询接口。

## 股票搜索

### GET /api/stock/search

搜索股票。

**参数**：

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| symbol | 是 | - | 搜索关键词 |
| limit | 否 | 20 | 每页数量 |
| page | 否 | 1 | 页码 |

**响应**：`ApiResponse<StockSearchResult>`

```json
{
  "success": true,
  "data": {
    "stocks": [
      { "id": 1, "symbol": "AAPL", "name": "Apple Inc.", "logo": "data:image/png;base64,..." }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  },
  "message": null
}
```

### POST /api/stock/kline_chart

K 线图 + 成交量图表。

**请求体**（复用 `finviz_sdk::StockQuery`）：

```json
{
  "symbol": "AAPL",
  "interval": "D",
  "valid_ranges": "1y"
}
```

**响应**：
- 成功：`image/png`（K 线蜡烛图 + 底部成交量柱状图）
- 失败：`application/json`

## Finviz 接口

### POST /api/finviz/stock

股票报价。

**请求体**：`StockQuery`（来自 `finviz_sdk`）
**响应**：`ApiResponse<Stock>`（来自 `finviz_sdk`）

### POST /api/finviz/screener

股票筛选。

**请求体**：`ScreenerQuery`
**响应**：`ApiResponse<Vec<Ticker>>`

### POST /api/finviz/news

新闻查询。

**请求体**：`NewsQuery`
**响应**：`ApiResponse<Vec<NewsItem>>`

### POST /api/finviz/calendar/economics

经济日历。

**请求体**：`EconomicsQuery`（来自 `finviz_sdk`）
**响应**：`ApiResponse<Vec<Economics>>`

### POST /api/finviz/calendar/earnings

财报日历。

**请求体**：`EarningsQuery`（来自 `finviz_sdk`）
**响应**：`ApiResponse<Vec<Earnings>>`

## Benzinga 接口

### POST /api/benzinga/calendar/ipo

IPO 日历。

**请求体**：`calendar::IPOQuery`（来自 `benzinga_sdk`）
**响应**：`ApiResponse<Vec<Ipo>>`

### POST /api/benzinga/calendar/economics

经济日历。

**请求体**：`calendar::EconomicsQuery`
**响应**：`ApiResponse<Vec<Economics>>`

### POST /api/benzinga/calendar/earnings

财报日历。

**请求体**：`calendar::EarningsQuery`
**响应**：`ApiResponse<Vec<Earnings>>`

## Alpaca 接口

### POST /api/alpaca/snapshot

股票快照。

**请求体**：`SnapshotQuery`（来自 `alpaca_sdk`）
**响应**：`ApiResponse<Snapshot>`

## 工具接口

### GET /api/tool/timestamp/akamai

获取 Akamai CDN 时间戳。

**响应**：`ApiResponse<u64>`

```json
{
  "success": true,
  "data": 1722789123,
  "message": null
}
```
