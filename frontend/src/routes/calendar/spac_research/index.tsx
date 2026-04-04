import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { RequireRole } from "#/components/RequireRole";
import { useState, useEffect } from "react";
import {
  Text,
  Container,
  Table,
  Badge,
  Loader,
  Center,
  SegmentedControl,
} from "@mantine/core";
import type { SPACResearchItem } from "#/services/api";
import { spacApi } from "#/services/api";

const EVENT_TYPES = [
  "All",
  "IpoDate",
  "ApprovalVote",
  "AmendmentVote",
  "LiqDeadline",
];

const eventColors: Record<string, string> = {
  IpoDate: "blue",
  ApprovalVote: "green",
  AmendmentVote: "orange",
  LiqDeadline: "red",
};

function RouteComponent() {
  const [data, setData] = useState<SPACResearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await spacApi.Research();
        setData(result);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData =
    filter === "All" ? data : data.filter((item) => item.event === filter);

  return (
    <RequireRole required={1}>
      <Container>
        <SegmentedControl
          mb="md"
          value={filter}
          onChange={setFilter}
          data={EVENT_TYPES}
        />

        {loading ? (
          <Center mt="xl">
            <Loader size="sm" />
          </Center>
        ) : filteredData.length === 0 ? (
          <Text ta="center" mt="xl" c="dimmed">
            No data available
          </Text>
        ) : (
          <Table mt="xl" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Symbol</Table.Th>
                <Table.Th>Event</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredData.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.date}</Table.Td>
                  <Table.Td>
                    <Badge color="blue">{item.symbol}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={eventColors[item.event] || "gray"}>
                      {item.event}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Container>
    </RequireRole>
  );
}

const ProtectedRouteComponent = withAuthGuard(RouteComponent);

export const Route = createFileRoute("/calendar/spac_research/")({
  component: ProtectedRouteComponent,
});
