import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// API 错误类型
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API 客户端配置
// 使用相对路径，让 Vite 代理转发到后端
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Access Token 存储键名（内存中，页面刷新丢失）
let accessToken: string | null = null;

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // 重要：允许携带 cookie
});

// 请求拦截器 - 添加认证头
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 是否正在刷新 token
let isRefreshing = false;
// 等待刷新完成的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 通知所有等待的请求
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
}

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;

    // 401 错误 - 尝试刷新 token（排除登录/注册/刷新请求）
    if (error.response?.status === 401 && originalRequest) {
      // 登录、注册、刷新 token 的请求不走这个逻辑
      const authUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
      if (authUrls.some(url => originalRequest.url?.includes(url))) {
        throw new ApiError('AUTH_FAILED', error.response?.data?.error?.message || '认证失败', 401);
      }

      // 如果没有 token，直接跳转登录
      if (!accessToken) {
        window.location.href = '/login';
        throw new ApiError('NO_TOKEN', '请先登录', 401);
      }

      // 正在刷新中，加入等待队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // 刷新 token（不需要传 refresh_token，cookie 会自动携带）
        const response = await axios.post<ApiResponse<{ access_token: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.success && response.data.data) {
          const { access_token } = response.data.data;
          accessToken = access_token;
          
          // 通知等待的请求
          onTokenRefreshed(access_token);
          
          // 重试原请求
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        // 刷新失败，清除 token 并重定向
        accessToken = null;
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    // 其他错误
    const apiError = error.response?.data?.error;
    if (apiError) {
      throw new ApiError(apiError.code, apiError.message, error.response?.status);
    }

    throw new ApiError('UNKNOWN_ERROR', error.message, error.response?.status);
  }
);

// API 方法封装
export const api = {
  get: <T>(url: string, params?: unknown) =>
    apiClient.get<ApiResponse<T>, ApiResponse<T>>(url, { params }),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<ApiResponse<T>, ApiResponse<T>>(url, data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<ApiResponse<T>, ApiResponse<T>>(url, data),

  delete: <T>(url: string) =>
    apiClient.delete<ApiResponse<T>, ApiResponse<T>>(url),

  // Token 管理（只管理 access token）
  setAccessToken: (token: string) => {
    accessToken = token;
  },

  clearAccessToken: () => {
    accessToken = null;
  },

  getAccessToken: () => accessToken,
};

export default api;
