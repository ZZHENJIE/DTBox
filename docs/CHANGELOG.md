# 更新日志

## [Unreleased]

### Docs

- 同步 `docs/client.md` 与 `client/README.md` 1:1 镜像（新增 `get_user_info`/`open_time_window`/`open_url`/`window-state` 三窗口图、`get_with_auth` 已启用等）
- 同步 `docs/web.md` 与 `web/README.md` 1:1 镜像（更新 8 路由、新增 i18n/LanguageSync/部署模型/Lint 章节）
- 按代码更正 `docs/architecture.md`（三窗口架构图、补 `opener`/`window-state`/`time_window`、`GET /api/user/refresh`）
- 按代码更正 `docs/auth-flow.md`（AccessToken 载荷 `server/src/util/jwt.rs:6` 不含 `role`、RefreshToken `Uuid`+SHA256、免密登录 `auto_login` 细节、登出仅 `Bearer`、IPC 补 13 条全量含 `avatar`/`open_url`/`open_time_window`）

## [0.1.0]

### Added

- 初始版本

### Changed

- Client 重构为纯认证外壳
- Web 重构为完整 SPA，仅在 Tauri 子窗口运行
