import { useEffect, useState } from "react";

import { useAuth } from "~/hooks/use-auth";
import { akamaiTimestamp } from "~/lib/endpoints";
import { parseSettings } from "~/lib/settings";
import { Skeleton } from "~/components/ui/skeleton";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TimeWindowPage() {
  const { user } = useAuth();
  const timeWindow = parseSettings(user?.settings).time_window;

  const [now, setNow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    akamaiTimestamp()
      .then((ts) => {
        if (cancelled) return;

        const base = ts;
        const start = Date.now();
        setNow(base);

        timer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - start) / 1000);
          setNow(base + elapsed);
        }, 200);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {loading && <Skeleton className="h-12 w-44" />}

      {!loading && error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {!loading && !error && now != null && (
        <div
          className="font-mono"
          style={{
            fontSize: `${timeWindow.text_size}px`,
            color: timeWindow.text_color,
          }}
        >
          {formatTime(now)}
        </div>
      )}
    </div>
  );
}
