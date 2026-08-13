import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { searchStocks } from "~/lib/endpoints";
import type { StockItem } from "~/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";

const PAGE_SIZE = 20;

export default function StockSearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (target: number) => {
    const sym = keyword.trim();
    if (!sym) return;

    setLoading(true);
    setError(null);
    try {
      const res = await searchStocks(sym, target, PAGE_SIZE);
      setStocks(res.stocks);
      setTotal(res.total);
      setPage(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStocks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">股票搜索</h1>
        <p className="text-muted-foreground text-sm">
          搜索本地股票库（Server 端前缀匹配）
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入股票代码，如 AAPL"
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading}>
              搜索
            </Button>
          </form>

          {loading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          {!loading && !error && stocks.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stocks.map((stock) => (
                <button
                  key={stock.id}
                  type="button"
                  onClick={() =>
                    navigate(`/chart?symbol=${encodeURIComponent(stock.symbol)}`)
                  }
                  className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                >
                  <Avatar className="size-10">
                    <AvatarImage src={stock.logo} alt={stock.symbol} />
                    <AvatarFallback>
                      {stock.symbol.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{stock.symbol}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {stock.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                共 {total} 条 · 第 {page} / {totalPages} 页
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => void run(page - 1)}
                >
                  <ChevronLeft />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => void run(page + 1)}
                >
                  下一页
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
