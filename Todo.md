高优先级 🔴

1. **Refresh Token验证不安全** (`src/api/users/refresh.rs:28-34`)
   - 从Cookie读取user_id，攻击者可伪造
   - 应只依赖refresh_token本身验证，user_id从数据库查询获得

2. **无Logout/Token撤销** 
   - `revoked`字段存在但未使用
   - 无法主动使token失效

---

### 中优先级 🟡

3. **缺少Rate Limiting**
   - 登录和refresh接口无频率限制

4. **错误信息泄露**
   - 直接返回 `err.to_string()` 暴露数据库结构

5. **关键操作无日志**
   - 登录、刷新等敏感操作无审计日志

---

### 低优先级 🟢

6. **响应格式不一致**
   - refresh返回纯字符串，其他返回JSON对象

7. **JWT的jti未用于追踪**
   - 生成了UUID但未存储或用于撤销验证
