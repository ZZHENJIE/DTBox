import { Table, Badge, Text, Tooltip, Box } from "@mantine/core";
import type { FinvizScreenerResult } from "../../../../services/market";

interface ScreenerFinvizTableProps {
  data: FinvizScreenerResult[];
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ScreenerFinvizTable({
  data,
  pageSize,
  currentPage,
}: ScreenerFinvizTableProps) {
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Box style={{ height: 500, overflowY: "auto" }}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>No.</Table.Th>
            <Table.Th>Ticker</Table.Th>
            <Table.Th>Company</Table.Th>
            <Table.Th>Sector</Table.Th>
            <Table.Th>Industry</Table.Th>
            <Table.Th>Country</Table.Th>
            <Table.Th>Market Cap</Table.Th>
            <Table.Th>P/E</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Change</Table.Th>
            <Table.Th>Volume</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedData.map((item) => (
            <Table.Tr key={item["No."]}>
              <Table.Td>
                {(currentPage - 1) * pageSize + (item["No."] as number)}
              </Table.Td>
              <Table.Td style={{ width: 100 }}>
                <Badge color="blue">{item.Ticker}</Badge>
              </Table.Td>
              <Table.Td>
                <Tooltip label={item.Company}>
                  <Text
                    style={{
                      maxWidth: 150,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.Company}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Tooltip label={item.Sector}>
                  <Text
                    style={{
                      maxWidth: 100,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.Sector}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Tooltip label={item.Industry}>
                  <Text
                    style={{
                      maxWidth: 120,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.Industry}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td>{item.Country}</Table.Td>
              <Table.Td>
                {item[" Market Cap"]
                  ? item[" Market Cap"].toLocaleString()
                  : "-"}
              </Table.Td>
              <Table.Td>{item["P/E"] ?? "-"}</Table.Td>
              <Table.Td>{item.Price ?? "-"}</Table.Td>
              <Table.Td>{item.Change}</Table.Td>
              <Table.Td>
                {item.Volume ? item.Volume.toLocaleString() : "-"}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
