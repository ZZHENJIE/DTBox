import { useState, useEffect } from "react";
import { RequireRole } from "#/components/RequireRole";
import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { useUserStore } from "#/stores/useUserStore";
import { screenerApi } from "#/services/api";
import {
  Container,
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
import type { ScreenerFinvizItem } from "#/services/api";
import { ScreenerFinvizTable } from "./ScreenerFinvizTable";
import { ScreenerFinvizCharts } from "./ScreenerFinvizCharts";

interface Parameter {
  query: string;
  label: string;
}

function RouteComponent() {
  const { user } = useUserStore();
  const [selectedParam, setSelectedParam] = useState<string | null>(null);
  const [data, setData] = useState<ScreenerFinvizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [view, setView] = useState("table");

  const finvizConfig = (user?.config as Record<string, unknown>)?.finviz as
    | Record<string, unknown>
    | undefined;
  const screenerConfig = finvizConfig?.screener as
    | Record<string, unknown>
    | undefined;
  const thumbnailConfig = finvizConfig?.thumbnail as
    | Record<string, unknown>
    | undefined;

  const params: Parameter[] = (screenerConfig?.params as Parameter[]) || [];
  const pageSize: number = (screenerConfig?.pageSize as number) || 20;
  const autoRefresh: boolean =
    (screenerConfig?.autoRefresh as boolean) || false;
  const autoRefreshInterval: number =
    (screenerConfig?.autoRefreshInterval as number) || 60;

  const period = (thumbnailConfig?.period as string) || "d";
  const preMarket = (thumbnailConfig?.preMarket as boolean) || false;
  const postMarket = (thumbnailConfig?.postMarket as boolean) || false;

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
      const result = await screenerApi.Finviz(param.query);
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
    <RequireRole required={1}>
      <Container size="xl">
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
                period={period as any}
                preMarket={preMarket}
                postMarket={postMarket}
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
      </Container>
    </RequireRole>
  );
}

const ProtectedRouteComponent = withAuthGuard(RouteComponent);

export const Route = createFileRoute("/tool/screener_finviz/")({
  component: ProtectedRouteComponent,
});
