import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
  // 不需要重定向的路径（如 404、无权限页面）
  allowAuthenticated?: boolean;
}

export function PublicRoute({ children, allowAuthenticated = false }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  // 如果 allowAuthenticated 为 true，已登录用户也可以访问（如 404 页面）
  if (allowAuthenticated) {
    return <>{children}</>;
  }

  // 未登录用户不能访问，重定向到登录页
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // 已登录用户访问登录/注册页，重定向到首页
  return <Navigate to="/" replace />;
}
