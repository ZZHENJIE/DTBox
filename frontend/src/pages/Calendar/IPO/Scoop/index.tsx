import { useState, useEffect } from "react";
import {
  Text,
  Stack,
  Table,
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
        <Box style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 100 }}>Symbol</Table.Th>
                <Table.Th style={{ minWidth: 200 }}>Company</Table.Th>
                <Table.Th style={{ minWidth: 150 }}>Managers</Table.Th>
                <Table.Th>Shares(Million)</Table.Th>
                <Table.Th style={{ width: 120 }}>Price Range</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td style={{ maxWidth: 100 }}>
                    <Tooltip
                      label={item.symbol}
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <Text
                        component="span"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {item.symbol}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 200 }}>
                    <Tooltip
                      label={item.company}
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <Text
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.company}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td style={{ maxWidth: 200 }}>
                    <Tooltip
                      label={item.managers}
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <Text
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.managers}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>{item.shares_millions}</Table.Td>
                  <Table.Td style={{ maxWidth: 120 }}>
                    <Tooltip
                      label={`${item.price_low} - ${item.price_high}`}
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <Text
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.price_low} - {item.price_high}
                      </Text>
                    </Tooltip>
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
