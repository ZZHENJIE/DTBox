import { useState, useEffect } from "react";
import {
  Text,
  Stack,
  Table,
  Badge,
  Loader,
  Center,
  Tooltip,
  Box,
} from "@mantine/core";
import { marketService } from "@/services/market";

function IPOScoopContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await marketService.getIpoScoop();
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
    <Stack>
      {loading ? (
        <Center mt="xl">
          <Loader size="sm" />
        </Center>
      ) : data.length === 0 ? (
        <Text ta="center" mt="xl" c="dimmed">
          No data available
        </Text>
      ) : (
        <Box mt="xl" style={{ height: 500, overflowY: "auto" }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Symbol</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Managers</Table.Th>
                <Table.Th>Shares (Millions)</Table.Th>
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
        </Box>
      )}
    </Stack>
  );
}

export function IPOScoopPage() {
  return <IPOScoopContent />;
}
