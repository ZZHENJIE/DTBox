import { Table, Badge, Text, Tooltip, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { FinvizScreenerResult } from "../../../../services/market";
import { getThumbnailUrl } from "../../../../utils/getFinvizThumbnailUrl";
import { useSettingsStore } from "../../../../stores/settingsStore";
import { ThumbnailImage } from "../../../../components/ThumbnailImage";

interface ScreenerFinvizTableProps {
  data: FinvizScreenerResult[];
  pageSize: number;
  currentPage: number;
}

export function ScreenerFinvizTable({
  data,
  pageSize,
  currentPage,
}: ScreenerFinvizTableProps) {
  const isDesktop = useMediaQuery("(min-width: 830px)");
  const { settings } = useSettingsStore();
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Box style={{ overflowX: "auto" }}>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 50 }}>No.</Table.Th>
            <Table.Th style={{ width: 80 }}>Symbol</Table.Th>
            <Table.Th>Company</Table.Th>
            <Table.Th>Sector</Table.Th>
            <Table.Th>Industry</Table.Th>
            <Table.Th style={{ width: 80 }}>Country</Table.Th>
            <Table.Th style={{ width: 100 }}>Market Cap(Million)</Table.Th>
            <Table.Th>P/E</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Change</Table.Th>
            <Table.Th>Volume</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedData.map((item) => {
            const thumbnailUrl = getThumbnailUrl(
              item.Ticker,
              settings.finviz.thumbnail,
            );

            return (
              <Table.Tr key={item["No."]}>
                <Table.Td>
                  {(currentPage - 1) * pageSize + (item["No."] as number)}
                </Table.Td>
                <Table.Td style={{ width: 80 }}>
                  {isDesktop ? (
                    <Tooltip
                      label={
                        <ThumbnailImage
                          ticker={item.Ticker}
                          src={thumbnailUrl}
                          skeletonWidth={1180}
                          skeletonHeight={340}
                        />
                      }
                      position="top-start"
                      events={{ hover: true, focus: true, touch: true }}
                      transitionProps={{ transition: "fade", duration: 800 }}
                      styles={{
                        tooltip: {
                          backgroundColor: "#1a1a1a",
                          padding: 0,
                        },
                      }}
                    >
                      <Badge
                        color="blue"
                        component="a"
                        href={`/quote/${item.Ticker}`}
                        target="_blank"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 80,
                          display: "block",
                          textDecoration: "none",
                        }}
                      >
                        {item.Ticker}
                      </Badge>
                    </Tooltip>
                  ) : (
                    <Badge
                      color="blue"
                      component="a"
                      href={`/quote/${item.Ticker}`}
                      target="_blank"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 80,
                        display: "block",
                        textDecoration: "none",
                      }}
                    >
                      {item.Ticker}
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td style={{ maxWidth: 150 }}>
                  <Tooltip
                    label={item.Company}
                    events={{ hover: true, focus: true, touch: true }}
                  >
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
                <Table.Td style={{ maxWidth: 100 }}>
                  <Tooltip
                    label={item.Sector}
                    events={{ hover: true, focus: true, touch: true }}
                  >
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
                <Table.Td style={{ maxWidth: 120 }}>
                  <Tooltip
                    label={item.Industry}
                    events={{ hover: true, focus: true, touch: true }}
                  >
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
                <Table.Td style={{ maxWidth: 80 }}>
                  <Tooltip
                    label={item.Country}
                    events={{ hover: true, focus: true, touch: true }}
                  >
                    <Text
                      style={{
                        maxWidth: 80,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.Country}
                    </Text>
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  {item["Market Cap"]
                    ? item["Market Cap"].toLocaleString()
                    : "-"}
                </Table.Td>
                <Table.Td>{item["P/E"] ?? "-"}</Table.Td>
                <Table.Td>{item.Price ?? "-"}</Table.Td>
                <Table.Td>{item.Change}</Table.Td>
                <Table.Td>
                  {item.Volume ? item.Volume.toLocaleString() : "-"}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
