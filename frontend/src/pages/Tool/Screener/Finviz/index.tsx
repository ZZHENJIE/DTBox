import { useState, useEffect } from "react";
import {
  Stack,
  Select,
  Button,
  Text,
  Loader,
  Center,
  Group,
  Box,
  Pagination,
  Tabs,
} from "@mantine/core";
import {
  marketService,
  type FinvizScreenerResult,
} from "../../../../services/market";
import { useSettingsStore } from "../../../../stores/settingsStore";
import { ScreenerFinvizTable } from "./ScreenerFinvizTable";
import { ScreenerFinvizCharts } from "./ScreenerFinvizCharts";

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

  return (
    <Stack>
      <Group mt="md">
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
          style={{ width: 200 }}
          disabled={autoRefresh && !paused && countdown > 0}
        />
        {autoRefresh && data.length > 0 ? (
          <Button variant="outline" onClick={() => setPaused(!paused)}>
            {paused ? "Start" : "Pause"}
          </Button>
        ) : (
          <Button
            onClick={() => handleSearch()}
            loading={loading}
            disabled={!selectedParam}
          >
            Search
          </Button>
        )}
      </Group>

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
              onPageChange={setCurrentPage}
            />
          ) : (
            <ScreenerFinvizCharts
              data={data}
              interval={interval}
              preMarket={preMarket}
              afterHours={afterHours}
            />
          )}
          {(autoRefresh || lastUpdate) && (
            <Group justify="space-between" mt="md">
              <Group>
                {autoRefresh && !paused && countdown > 0 && (
                  <Text c="dimmed">Refresh in {countdown}s</Text>
                )}
              </Group>
              {view === "table" && totalPages > 1 ? (
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                />
              ) : (
                <Box />
              )}
              <Group>
                {lastUpdate && (
                  <Text c="dimmed" size="sm">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </Text>
                )}
              </Group>
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}

export function FinvizScreenerPage() {
  return <ScreenerFinvizContent />;
}
