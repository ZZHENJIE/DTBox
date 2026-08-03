import { NavLink, useNavigate } from 'react-router-dom'
import { Shield, CircleUser, User, Key, ChevronDown, LineChart, TrendingUp } from 'lucide-react'
import { cn } from '~/lib/utils'
import { useAuth } from '~/hooks/use-auth'
import { ROLE_LABELS, type Role } from '~/types/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

export function Header() {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="h-14 flex items-center px-6 border-b bg-card flex-shrink-0 gap-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            'text-sm font-semibold whitespace-nowrap transition-colors',
            isActive ? 'text-primary' : 'text-foreground hover:text-primary',
          )
        }
      >
        DTBox
      </NavLink>

      <nav className="flex items-center gap-1 h-full">
        <NavLink
          to="/chart"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 h-full px-3 text-sm transition-colors border-b-2 border-transparent',
              isActive
                ? 'text-primary border-primary'
                : 'text-muted-foreground hover:text-foreground hover:border-border',
            )
          }
        >
          <LineChart className="size-4" />
          <span>Chart</span>
        </NavLink>
        <NavLink
          to="/finviz/quote"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 h-full px-3 text-sm transition-colors border-b-2 border-transparent',
              isActive
                ? 'text-primary border-primary'
                : 'text-muted-foreground hover:text-foreground hover:border-border',
            )
          }
        >
          <TrendingUp className="size-4" />
          <span>Finviz Quote</span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 h-full px-3 text-sm transition-colors border-b-2 border-transparent',
                isActive
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-border',
              )
            }
          >
            <Shield className="size-4" />
            <span>用户管理</span>
          </NavLink>
        )}
      </nav>

      <div className="ml-auto">
        {loading ? (
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent outline-none">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="size-5 rounded-full object-cover" />
              ) : (
                <CircleUser className="size-5 text-muted-foreground" />
              )}
              <span>{user.name}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {ROLE_LABELS[user.role as Role] || '用户'}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="size-4" />
                个人中心
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/password')}>
                <Key className="size-4" />
                修改密码
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  )
}
