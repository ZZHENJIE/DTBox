import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CandlestickChart,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  SearchX,
} from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { searchStocks } from "~/lib/endpoints";
import type { StockItem } from "~/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "./ScrollArea";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chart", label: "K 线图", icon: CandlestickChart },
  { to: "/search", label: "股票搜索", icon: Search },
  { to: "/calendar", label: "财经日历", icon: CalendarDays },
  { to: "/docs", label: "文档", icon: FileText },
];

export function Sidebar() {
  const { user, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = keyword.trim();

    const timer = setTimeout(async () => {
      if (!trimmed) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await searchStocks(trimmed, 1, 8);
        setResults(res.stocks);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const displayName = user?.name ?? "用户";
  const avatarUrl = user?.avatar || undefined;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <span className="text-primary flex size-7 items-center justify-center rounded-md bg-primary/15 text-sm font-bold">
          DT
        </span>
        <span className="text-base font-semibold">DTBox</span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索股票代码…"
            className="pl-8"
          />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-1">
            {loading && (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            )}
            {!loading && error && (
              <p className="text-destructive px-2 py-1 text-xs">{error}</p>
            )}
            {!loading && !error && results.length === 0 && keyword.trim() && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <SearchX className="text-muted-foreground size-5" />
                <p className="text-muted-foreground text-xs">无匹配结果</p>
              </div>
            )}
            {!loading &&
              results.map((stock) => (
                <button
                  key={stock.id}
                  type="button"
                  onClick={() => navigate(`/chart?symbol=${encodeURIComponent(stock.symbol)}`)}
                  className="hover:bg-accent/60 flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={stock.logo} alt={stock.symbol} />
                    <AvatarFallback className="text-[10px]">
                      {stock.symbol.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{stock.symbol}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {stock.name}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-9">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{displayName}</div>
            {userId && (
              <Badge variant="outline" className="mt-0.5 text-[10px]">
                ID {userId}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void logout()}
            title="登出"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
