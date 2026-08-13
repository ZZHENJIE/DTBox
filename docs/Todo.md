# Todo

## Client

- [x] 完善主窗口服务器地址配置的持久化（localStorage 持久化 + `GET /api/health` 测试连接）

## Server

- [ ] 修复 `/api/stock/kline_chart` K 线图接口
- [ ] 优化配置文件读取方式

## Web 前端

- [ ] 完善 Dashboard 页面（Finviz / Alpaca 数据集成）
- [ ] 结果集成到左侧边栏

## 脚本

- [ ] 优化 `update_stocks_table.ts`，改为增量更新而非清空重写
