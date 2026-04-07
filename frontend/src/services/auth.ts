import { api, ApiError } from './api';
import type { User } from '../stores/authStore';

// 用户类型定义
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserInfoResponse {
  id: number;
  username: string;
  permissions: number;
  config: Record<string, unknown>;
  created_at: string;
}

// 认证服务
export const authService = {
  // 登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (!response.success || !response.data) {
      throw new ApiError('LOGIN_FAILED', response.message || '登录失败');
    }

    // 只保存 access token 到内存
    api.setAccessToken(response.data.access_token);
    
    return response.data;
  },

  // 注册
  async register(credentials: RegisterCredentials): Promise<{ user_id: number; username: string }> {
    const response = await api.post<{ user_id: number; username: string }>('/auth/register', credentials);
    
    if (!response.success || !response.data) {
      throw new ApiError('REGISTER_FAILED', response.message || '注册失败');
    }

    return response.data;
  },

  // 刷新 Token（不需要传参数，cookie 自动携带）
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', {});
    
    if (!response.success || !response.data) {
      throw new ApiError('REFRESH_FAILED', response.message || '刷新令牌失败');
    }

    // 更新内存中的 access token
    api.setAccessToken(response.data.access_token);
    
    return response.data;
  },

  // 登出
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // 忽略错误
    } finally {
      // 清除内存中的 token
      api.clearAccessToken();
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await api.get<UserInfoResponse>('/users/me');
    
    if (!response.success || !response.data) {
      throw new ApiError('GET_USER_FAILED', response.message || '获取用户信息失败');
    }

    const data = response.data;
    return {
      id: data.id,
      username: data.username,
      permissions: data.permissions as 0 | 1 | 5,
      config: data.config,
      createdAt: data.created_at,
    };
  },

  // 更新用户名
  async updateUsername(newUsername: string): Promise<User> {
    const response = await api.post<UserInfoResponse>('/users/me', {
      username: newUsername,
    });
    
    if (!response.success || !response.data) {
      throw new ApiError('UPDATE_FAILED', response.message || '更新失败');
    }

    const data = response.data;
    return {
      id: data.id,
      username: data.username,
      permissions: data.permissions as 0 | 1 | 5,
      config: data.config,
      createdAt: data.created_at,
    };
  },

  // 更新密码
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await api.put<{ message: string }>('/users/password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    
    if (!response.success) {
      throw new ApiError('UPDATE_PASSWORD_FAILED', response.message || '密码修改失败');
    }
  },

  // 检查用户名是否可用
  async checkUsername(username: string): Promise<boolean> {
    const response = await api.get<{ available: boolean }>('/auth/check-username', { username });
    
    if (!response.success || !response.data) {
      throw new ApiError('CHECK_USERNAME_FAILED', response.message || '检查用户名失败');
    }

    return response.data.available;
  },

  // 获取 token（用于初始化）
  getAccessToken: api.getAccessToken,
};
