import { useState, useEffect, useRef } from "react";
import {
  Stack,
  Select,
  Text,
  Loader,
  Center,
  Group,
  Box,
  ActionIcon,
} from "@mantine/core";
import {
  marketService,
  type FinvizScreenerResult,
} from "../../../../services/market";
import { useSettingsStore } from "../../../../stores/settingsStore";
import { ScreenerFinvizTable } from "./ScreenerFinvizTable";
import { ScreenerFinvizCharts } from "./ScreenerFinvizCharts";
import { ScreenerPagination } from "./ScreenerPagination";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";

interface Param {
  query: string;
  label: string;
}

function ScreenerFinvizContent() {
  const { settings } = useSettingsStore();
  const [selectedParam, setSelectedParam] = useState<string | null>(() => {
    const params = settings.finviz.screener.parameter;
    return params.length > 0 ? params[0].label : null;
  });
  const [data, setData] = useState<FinvizScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [view, setView] = useState("table");
  const isFetchingRef = useRef(false);

  const params: Param[] = settings.finviz.screener.parameter.map((p) => ({
    query: p.value,
    label: p.label,
  }));
  const pageSize: number = settings.finviz.screener.page_count;
  const autoRefresh: boolean = settings.finviz.screener.auto_refersh > 0;
  const autoRefreshInterval: number = settings.finviz.screener.auto_refersh;

  const interval = settings.finviz.thumbnail.interval;
  const preMarket = settings.finviz.thumbnail.pre_market;
  const afterHours = settings.finviz.thumbnail.after_hours;

  const totalPages = Math.ceil(data.length / pageSize);

  const fetchData = async (silent = false) => {
    if (!selectedParam) return;
    const param = params.find((p) => p.label === selectedParam);
    if (!param) return;

    if (!silent) {
      setLoading(true);
    }
    setCountdown(0);
    isFetchingRef.current = true;
    setCurrentPage(1);
    try {
      const result = await marketService.getScreener(param.query);
      setData(result);
    } catch {
      setData([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!autoRefresh || !selectedParam || data.length === 0 || !isRunning) {
      setCountdown(0);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev >= autoRefreshInterval && !isFetchingRef.current) {
          fetchData(true);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, autoRefreshInterval, selectedParam, data.length, isRunning]);

  const progress =
    autoRefresh && data.length > 0
      ? isRunning
        ? Math.max(1, (countdown / autoRefreshInterval) * 100)
        : 1
      : 0;

  return (
    <Stack>
      <Box
        p="md"
        style={{
          position: "sticky",
          top: 76,
          zIndex: 10,
          backgroundColor: "var(--mantine-color-body)",
          borderRadius: "var(--mantine-radius-md)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${progress}%`,
            borderRadius: "var(--mantine-radius-md)",
            transition: "width 0.7s linear",
            pointerEvents: "none",
            background: "var(--mantine-color-violet-9)",
            opacity: progress > 0 ? 0.3 : 0,
          }}
        />
        <Group justify="center" style={{ position: "relative" }}>
          <Select
            value={view}
            onChange={(v) => setView(v || "table")}
            data={[
              { value: "table", label: "Table" },
              { value: "chart", label: "Charts" },
            ]}
            style={{ width: 95 }}
          />
          <Select
            placeholder="Select parameter"
            value={selectedParam}
            onChange={setSelectedParam}
            data={params.map((p) => ({ value: p.label, label: p.label }))}
            style={{ width: 130 }}
            disabled={isRunning}
          />
          <ActionIcon
            variant={data.length > 0 ? "outline" : "filled"}
            onClick={() => {
              if (data.length === 0 || !isRunning) {
                fetchData();
                setIsRunning(true);
              } else {
                setIsRunning(false);
              }
            }}
            loading={loading}
            disabled={!selectedParam}
          >
            {isRunning ? (
              <IconPlayerPause size={18} />
            ) : (
              <IconPlayerPlay size={18} />
            )}
          </ActionIcon>
        </Group>
      </Box>

      {loading ? (
        <Center mt="xl">
          <Loader size="sm" />
        </Center>
      ) : data.length === 0 ? (
        <Text ta="center" mt="xl" c="dimmed">
          No data
        </Text>
      ) : (
        <>
          {view === "table" ? (
            <ScreenerFinvizTable
              data={data}
              pageSize={pageSize}
              currentPage={currentPage}
            />
          ) : (
            <ScreenerFinvizCharts
              data={data}
              interval={interval}
              preMarket={preMarket}
              afterHours={afterHours}
              pageSize={pageSize}
              currentPage={currentPage}
            />
          )}
          <ScreenerPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </Stack>
  );
}

export function FinvizScreenerPage() {
  return <ScreenerFinvizContent />;
}
