# DTBox API 文档

## 基础信息

- **基础 URL**: `http://localhost:端口号`
- **版本**: `/api/version` (GET)

---

## 用户接口

### 注册用户

- **URL**: `POST /api/users/register`
- **认证**: 否
- **请求体**:
```json
{
  "name": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": true
}
```

---

### 用户登录

- **URL**: `POST /api/users/login`
- **认证**: 否
- **请求体**:
```json
{
  "name": "string",
  "password": "string"
}
```
- **响应**: 设置 `refresh_token` 和 `user_id` Cookie，返回:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```
- **Cookie**:
  - `refresh_token`: HTTP-only, Secure, Lax, Path: /
  - `user_id`: HTTP-only, Secure, Lax, Path: /

---

### 检查用户名是否存在

- **URL**: `GET /api/users/exists?name=用户名`
- **认证**: 否
- **查询参数**:
  - `name` (required): 用户名
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": true/false
}
```

---

### 刷新 Token

- **URL**: `POST /api/users/refresh`
- **认证**: Cookie (refresh_token, user_id)
- **请求体**:
```json
{}
```
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": "jwt_token_string"
}
```

---

### 获取用户信息

- **URL**: `GET /api/users/info`
- **认证**: JWT (Bearer Token)
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "string",
    "config": {},
    "permissions": 0,
    "create_time": "2024-01-01T00:00:00+00:00"
  }
}
```

---

### 修改用户信息

- **URL**: `POST /api/users/change`
- **认证**: JWT (Bearer Token)
- **请求体** (二选一):
```json
{
  "type": "Name",
  "data": "新用户名"
}
```
或
```json
{
  "type": "Config",
  "data": {}
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": true
}
```

---

### 用户登出

- **URL**: `POST /api/users/logout`
- **认证**: JWT (Bearer Token)
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 错误响应格式

所有接口错误响应格式:

```json
{
  "code": 错误码,
  "message": "错误信息",
  "data": null
}
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| -1 | 数据库错误 |
| -2 | 密码加密错误 |
| -3 | 字符串解析错误 |
| -4 | 密码Hash解析错误 |
| -5 | 数字解析错误 |
| -6 | HTTP请求错误 |
| -7 | CSV解析错误 |
| -8 | 网页解析错误 |
| -101 | Claims 为空 |
| -102 | RefreshToken 不存在 |
| -103 | Cookie 未找到 |
| -104 | RefreshToken 已过期 |
| -105 | RefreshToken 已撤销 |
| -106 | RefreshToken 错误 |
| -107 | RefreshToken 格式无效 |
| -108 | JWT 错误 |
| -201 | 用户不存在 |
| -202 | 密码错误 |

---

## 认证说明

### 需要 JWT 认证的接口

- `/api/users/info`
- `/api/users/change`
- `/api/users/logout`

使用 `Authorization: Bearer <token>` 头传递 JWT。

### 需要 Cookie 认证的接口

- `/api/users/refresh` - 需要 `refresh_token` 和 `user_id` Cookie
