export interface EndpointDef {
  id: string
  category: string
  label: string
  method: string
  path: string
  description: string
  auth: 'none' | 'access' | 'refresh' | 'admin'
  defaultBody?: string
  defaultQuery?: string
}

export const endpoints: EndpointDef[] = [
  {
    id: 'health',
    category: '公开接口',
    label: '健康检查',
    method: 'GET',
    path: '/api/health',
    description: 'GET /api/health - 服务健康检查',
    auth: 'none',
  },
  {
    id: 'user_check',
    category: '公开接口',
    label: '检查用户名',
    method: 'GET',
    path: '/api/user/check?name=test',
    description: 'GET /api/user/check - 检查用户名是否存在',
    auth: 'none',
    defaultQuery: 'name=test',
  },
  {
    id: 'user_create',
    category: '公开接口',
    label: '创建用户',
    method: 'POST',
    path: '/api/user/create',
    description: 'POST /api/user/create - 创建新用户',
    auth: 'none',
    defaultBody: JSON.stringify({ name: 'test', password: 'password123' }, null, 2),
  },
  {
    id: 'user_login',
    category: '公开接口',
    label: '用户登入',
    method: 'POST',
    path: '/api/user/login',
    description: 'POST /api/user/login - 登入，返回 Token',
    auth: 'none',
    defaultBody: JSON.stringify({ name: 'test', password: 'password123' }, null, 2),
  },
  {
    id: 'user_logout',
    category: '需要 AccessToken',
    label: '用户登出',
    method: 'POST',
    path: '/api/user/logout',
    description: 'POST /api/user/logout - 登出，撤销 RefreshToken',
    auth: 'access',
  },
  {
    id: 'user_password',
    category: '需要 AccessToken',
    label: '修改密码',
    method: 'POST',
    path: '/api/user/password',
    description: 'POST /api/user/password - 修改密码（需旧密码）',
    auth: 'access',
    defaultBody: JSON.stringify({ old_password: 'password123', new_password: 'newpass456' }, null, 2),
  },
  {
    id: 'user_profile',
    category: '需要 AccessToken',
    label: '修改个人信息',
    method: 'POST',
    path: '/api/user/profile',
    description: 'POST /api/user/profile - 修改 name/avatar/settings',
    auth: 'access',
    defaultBody: JSON.stringify({ name: 'newname', avatar: '', settings: {} }, null, 2),
  },
  {
    id: 'user_me',
    category: '需要 AccessToken',
    label: '获取当前用户',
    method: 'GET',
    path: '/api/user/me',
    description: 'GET /api/user/me - 获取当前用户信息',
    auth: 'access',
  },
  {
    id: 'user_refresh',
    category: '需要 RefreshToken',
    label: '刷新 Token',
    method: 'GET',
    path: '/api/user/refresh',
    description: 'GET /api/user/refresh - 刷新 AccessToken',
    auth: 'refresh',
  },
  {
    id: 'admin_info',
    category: '需要 Admin 权限',
    label: '用户列表',
    method: 'GET',
    path: '/api/admin/info/1',
    description: 'GET /api/admin/info/{page} - 分页获取用户列表',
    auth: 'admin',
  },
  {
    id: 'admin_change',
    category: '需要 Admin 权限',
    label: '修改用户信息',
    method: 'POST',
    path: '/api/admin/change',
    description: 'POST /api/admin/change - 修改任意用户信息',
    auth: 'admin',
    defaultBody: JSON.stringify({ user_id: 1, name: 'updated_name', role: 1 }, null, 2),
  },
]
