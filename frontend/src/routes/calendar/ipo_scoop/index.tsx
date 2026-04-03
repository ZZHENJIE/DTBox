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
  Tooltip,
} from "@mantine/core";
import type { IposcoopItem } from "#/services/api";
import { ipoApi } from "#/services/api";

function RouteComponent() {
  const [data, setData] = useState<IposcoopItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await ipoApi.Scoop();
        setData(result);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <RequireRole required={1}>
      <Container>
        {loading ? (
          <Center mt="xl">
            <Loader size="sm" />
          </Center>
        ) : data.length === 0 ? (
          <Text ta="center" mt="xl" c="dimmed">
            No data available
          </Text>
        ) : (
          <Table mt="xl" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Symbol</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Managers</Table.Th>
                <Table.Th>Shares (M)</Table.Th>
                <Table.Th>Price Range</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Badge color="blue">{item.symbol}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={item.company}>
                      <div
                        style={{
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.company}
                      </div>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={item.managers}>
                      <div
                        style={{
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.managers}
                      </div>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>{item.shares_millions}</Table.Td>
                  <Table.Td>
                    {item.price_low} - {item.price_high}
                  </Table.Td>
                  <Table.Td>{item.expected_date}</Table.Td>
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

export const Route = createFileRoute("/calendar/ipo_scoop/")({
  component: ProtectedRouteComponent,
});
