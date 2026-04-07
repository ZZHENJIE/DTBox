import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // 需要的最低权限等级，true=只要登录即可，数字=需要该权限等级以上
  requiredRole?: boolean | number;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果 requiredRole 是数字，检查权限等级
  if (typeof requiredRole === 'number' && user) {
    if (user.permissions < requiredRole) {
      // 权限不足，跳转到无权限页面
      return <Navigate to="/no-permission" replace />;
    }
  }

  return <>{children}</>;
}
