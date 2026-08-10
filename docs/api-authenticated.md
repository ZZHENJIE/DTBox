# 已认证接口

需要携带有效 Token 的 API。

## 请求头约定

| Header | 用途 |
|--------|------|
| `Authorization: Bearer <access_token>` | AccessToken 认证 |
| `Refresh-Token: <refresh_token>` | RefreshToken 认证 |

## AccessToken 接口

### POST /api/user/logout

登出，撤销 RefreshToken 并加入 AccessToken 黑名单。

**认证**：AccessToken + RefreshToken

### POST /api/user/password

修改密码，需提供旧密码。

**请求体**：

```json
{
  "old_password": "current",
  "new_password": "new-secure-password"
}
```

### POST /api/user/profile

修改个人资料。

**请求体**：

```json
{
  "name": "new-name",
  "avatar": "https://example.com/avatar.png",
  "settings": { "theme": "dark" }
}
```

所有字段可选，不传则不修改。

### GET /api/user/me

获取当前用户信息。

**响应**：`ApiResponse<InfoResult>`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "alice",
    "avatar": "",
    "role": 1,
    "settings": {},
    "created_at": "2025-01-01T00:00:00"
  },
  "message": null
}
```

---

## RefreshToken 接口

### GET /api/user/refresh

刷新 AccessToken。

**请求头**：`Refresh-Token: <refresh_token>`

**响应**：`ApiResponse<UserRefreshResult>`

```json
{
  "success": true,
  "data": { "access_token": "eyJhbG..." },
  "message": null
}
```

---

## Admin 接口

### GET /api/admin/info/{page}

分页获取用户列表。

**参数**：`page` - 页码（从 1 开始）

**响应**：`ApiResponse<AdminInfoResult>`

```json
{
  "success": true,
  "data": {
    "users": [{ "id": 1, "name": "alice", "avatar": "", "role": 1, "settings": {}, "created_at": "..." }],
    "total": 42,
    "page": 1,
    "page_size": 20
  },
  "message": null
}
```

### POST /api/admin/change

修改任意用户信息。

**请求体**：

```json
{
  "user_id": 1,
  "name": "new-name",
  "avatar": "...",
  "role": 2,
  "settings": {}
}
```

所有字段（除 `user_id`）可选，不传则不修改。
