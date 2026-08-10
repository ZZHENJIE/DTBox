# 公开接口

无需认证即可调用的 API。

## GET /api/health

健康检查。

**响应**：`ApiResponse<HealthCheckResult>`

```json
{
  "success": true,
  "data": { "version": "0.1.0" },
  "message": null
}
```

---

## GET /api/user/check

检查用户名是否已存在。

**参数**：`?name=<username>`

**响应**：`ApiResponse<UserCheckResult>`

```json
{
  "success": true,
  "data": { "exists": false },
  "message": null
}
```

---

## POST /api/user/create

注册新用户。

**请求体**：

```json
{
  "name": "alice",
  "password": "secure-password"
}
```

**响应**：`ApiResponse<UserCreateResult>`

```json
{
  "success": true,
  "data": { "user_id": 1 },
  "message": null
}
```

---

## POST /api/user/login

登录，返回 AccessToken 和 RefreshToken。

**请求头**：`Content-Type: application/json`

**请求体**：

```json
{
  "name": "alice",
  "password": "secure-password"
}
```

**响应**：`ApiResponse<UserLoginResult>`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "abc123...",
    "user_id": 1
  },
  "message": null
}
```

**限制**：
- 连续登录失败 5 次后锁定账号（`locked_until` 字段）
- 登录成功记录 IP 到 `login_logs` 表
