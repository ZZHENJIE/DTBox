import { useState, useEffect } from "react";
import {
  Stack,
  Select,
  Text,
  Loader,
  Center,
  Group,
  Tabs,
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

interface Parameter {
  query: string;
  label: string;
}

function ScreenerFinvizContent() {
  const { settings } = useSettingsStore();
  const [selectedParam, setSelectedParam] = useState<string | null>(null);
  const [data, setData] = useState<FinvizScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [view, setView] = useState("table");

  const params: Parameter[] = settings.finviz.screener.parameter.map((p) => ({
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

  const handleSearch = async (silent = false) => {
    if (!selectedParam) return;
    const param = params.find((p) => p.label === selectedParam);
    if (!param) return;

    if (!silent) {
      setLoading(true);
    }
    setCountdown(autoRefreshInterval);
    setCurrentPage(1);
    try {
      const result = await marketService.getScreener(param.query);
      setData(result);
      setLastUpdate(new Date());
    } catch {
      setData([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!autoRefresh || !selectedParam || data.length === 0 || paused) {
      setCountdown(0);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleSearch(true);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, autoRefreshInterval, selectedParam, data.length, paused]);

  const progress = autoRefresh && !paused && countdown > 0
    ? (1 - countdown / autoRefreshInterval) * 100
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
          background: `linear-gradient(to right, var(--mantine-color-violet-9) ${progress}%, var(--mantine-color-body) ${progress}%)`,
        }}
      >
        <Group justify="center">
          <Tabs value={view} onChange={(v) => setView(v || "table")}>
            <Tabs.List>
              <Tabs.Tab value="table">Table</Tabs.Tab>
              <Tabs.Tab value="chart">Charts</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <Select
            placeholder="Select parameter"
            value={selectedParam}
            onChange={setSelectedParam}
            data={params.map((p) => ({ value: p.label, label: p.label }))}
            style={{ width: 130 }}
            disabled={autoRefresh && !paused && countdown > 0}
          />
          {data.length > 0 ? (
            <ActionIcon variant="outline" onClick={() => setPaused(!paused)}>
              {paused ? (
                <IconPlayerPlay size={18} />
              ) : (
                <IconPlayerPause size={18} />
              )}
            </ActionIcon>
          ) : (
            <ActionIcon
              onClick={() => handleSearch()}
              loading={loading}
              disabled={!selectedParam}
            >
              <IconPlayerPlay size={18} />
            </ActionIcon>
          )}
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
            autoRefresh={autoRefresh}
            paused={paused}
            countdown={countdown}
            lastUpdate={lastUpdate}
          />
        </>
      )}
    </Stack>
  );
}

export function FinvizScreenerPage() {
  return <ScreenerFinvizContent />;
}
