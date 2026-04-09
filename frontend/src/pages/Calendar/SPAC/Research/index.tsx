import { useState, useEffect } from "react";
import {
  Text,
  Stack,
  Table,
  Badge,
  Loader,
  Center,
  Box,
  Select,
} from "@mantine/core";
import { marketService } from "@/services/market";

const EVENT_TYPES = [
  { value: "All", label: "All" },
  { value: "IpoDate", label: "IPO Date" },
  { value: "ApprovalVote", label: "Approval Vote" },
  { value: "AmendmentVote", label: "Amendment Vote" },
  { value: "LiqDeadline", label: "Liquidation Deadline" },
];

function SPACResearchContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await marketService.getSpacResearch();
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

  const getEventColor = (event: string) => {
    switch (event) {
      case "IpoDate":
        return "blue";
      case "ApprovalVote":
        return "green";
      case "AmendmentVote":
        return "orange";
      case "LiqDeadline":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Stack>
      {loading ? (
        <Center mt="xl">
          <Loader size="sm" />
        </Center>
      ) : (
        <Box style={{ overflowX: "auto" }}>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            maw={500}
            mx="auto"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 100 }}>Date</Table.Th>
                <Table.Th style={{ width: 100 }}>Symbol</Table.Th>
                <Table.Th>
                  <Select
                    label="Event"
                    size="xs"
                    value={filter}
                    onChange={(value) => setFilter(value || "All")}
                    data={EVENT_TYPES}
                  />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredData.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="dimmed">
                      No data available
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredData.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{item.date}</Table.Td>
                    <Table.Td style={{ maxWidth: 100 }}>
                      <Badge
                        color="blue"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.symbol}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getEventColor(item.event)}>
                        {item.event}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}

export function SPACResearchPage() {
  return <SPACResearchContent />;
}
