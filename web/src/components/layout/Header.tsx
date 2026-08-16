import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Filter,
  LogOut,
  Pencil,
  Search,
  SearchX,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { searchStocks } from "~/lib/endpoints";
import type { StockItem } from "~/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { openTimeWindow } from "~/lib/tauri";
import { ChangelogDialog } from "./ChangelogDialog";
import { ProfileDialog } from "./ProfileDialog";

const NAV_ITEMS = [
  { to: "/screener", label: "header.screener", icon: Filter },
];

const CALENDAR_ITEMS = [
  { label: "header.ipo", to: "/calendar/ipo" },
  { label: "header.spac", to: "/calendar/spac" },
  { label: "header.economics", to: "/calendar/economics" },
  { label: "header.earnings", to: "/calendar/earnings" },
];

const TOOLS_ITEMS = [
  { label: "header.testPage", to: "/tools/test" },
];

function roleKey(role: number): string {
  if (role === 2) return "role.subscriber";
  if (role === 5) return "role.admin";
  if (role === 1) return "role.user";
  return "role.unknown";
}

export function Header() {
  const { user, userId, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);

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

  const displayName = user?.name ?? t("role.user");
  const avatarUrl = user?.avatar || undefined;
  const isCalendarActive = location.pathname.startsWith("/calendar");
  const isToolsActive = location.pathname.startsWith("/tools");

  const goToQuote = (symbol: string) => {
    setKeyword("");
    setResults([]);
    setOpen(false);
    navigate(`/quote?symbol=${encodeURIComponent(symbol)}`);
  };

  const showDropdown = open && keyword.trim().length > 0;

  return (
    <header className="bg-card/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-6">
        <NavLink to="/screener" className="flex shrink-0 items-center gap-2">
          <img src="/icon.png" alt="DTBox" className="size-12 rounded-md" />
          <span className="text-base font-semibold">DTBox</span>
        </NavLink>

        <div className="relative w-64 shrink-0">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            placeholder={t("header.searchPlaceholder")}
            className="pl-8"
          />

          {showDropdown && (
            <div className="bg-popover absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-lg border shadow-lg">
              {loading && (
                <div className="flex flex-col gap-1 p-1">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              {!loading && error && (
                <p className="text-destructive px-3 py-2 text-xs">{error}</p>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                  <SearchX className="text-muted-foreground size-5" />
                  <p className="text-muted-foreground text-xs">
                    {t("header.noResults")}
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                results.map((stock) => (
                  <button
                    key={stock.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToQuote(stock.symbol)}
                    className="hover:bg-accent/60 flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors"
                  >
                    <Avatar className="size-7">
                      <AvatarImage src={stock.logo} alt={stock.symbol} />
                      <AvatarFallback className="text-[10px]">
                        {stock.symbol.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {stock.symbol}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {stock.name}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <nav className="flex flex-1 items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/screener"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {t(label)}
            </NavLink>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
                  isCalendarActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <CalendarDays className="size-4" />
                {t("header.calendar")}
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {CALENDAR_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onSelect={() => navigate(item.to)}
                >
                  {t(item.label)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
                  isToolsActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Wrench className="size-4" />
                {t("header.tools")}
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {TOOLS_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onSelect={() => navigate(item.to)}
                >
                  {t(item.label)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onSelect={() => void openTimeWindow()}>
                {t("header.timeWindow")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>
                  {displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span>{displayName}</span>
                  {user && (
                    <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                      {t(roleKey(user.role))}
                    </span>
                  )}
                </div>
                {userId && (
                  <span className="text-muted-foreground text-xs font-normal">
                    {t("header.idLabel")} {userId}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/settings")}>
              <Settings />
              {t("header.settings")}
            </DropdownMenuItem>
            {user?.role === 5 && (
              <DropdownMenuItem onSelect={() => navigate("/admin")}>
                <ShieldCheck />
                {t("header.admin")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
              <Pencil />
              {t("header.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setChangelogOpen(true)}>
              <FileText />
              {t("header.changelog")}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => void logout()}
            >
              <LogOut />
              {t("header.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangelogDialog open={changelogOpen} onOpenChange={setChangelogOpen} />
    </header>
  );
}
