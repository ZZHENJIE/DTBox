import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Text,
  SimpleGrid,
  UnstyledButton,
  Table,
  Badge,
  Loader,
  Center,
  Stack,
  Box,
  Tooltip,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  marketService,
  type FinvizCalendarEconomyItem,
} from "@/services/market";

function EconomyFinvizContent() {
  const [currentDate, setCurrentDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [weekRange, setWeekRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [data, setData] = useState<FinvizCalendarEconomyItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const current = dayjs(currentDate);
    const monday = current.day(1).format("YYYY-MM-DD");
    const friday = current.day(5).format("YYYY-MM-DD");
    setWeekRange({ start: monday, end: friday });
  }, [currentDate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await marketService.getCalendarEconomy(
          weekRange.start,
          weekRange.end,
        );
        setData(result);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (weekRange.start && weekRange.end) {
      fetchData();
    }
  }, [weekRange.start, weekRange.end]);

  const goToPrevWeek = () => {
    setCurrentDate((prev) =>
      dayjs(prev).subtract(7, "day").format("YYYY-MM-DD"),
    );
  };

  const goToNextWeek = () => {
    setCurrentDate((prev) =>
      dayjs(prev).add(7, "day").format("YYYY-MM-DD"),
    );
  };

  const weekDays: string[] = [];
  const current = dayjs(currentDate).day(1);
  for (let i = 0; i < 5; i++) {
    weekDays.push(current.add(i, "day").format("YYYY-MM-DD"));
  }

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
        }}
      >
        <Stack align="center" gap="xs">
          <Group gap="md">
            <ActionIcon variant="subtle" onClick={goToPrevWeek}>
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Text fw={700}>
              {weekRange.start} ~ {weekRange.end}
            </Text>
            <ActionIcon variant="subtle" onClick={goToNextWeek}>
              <IconChevronRight size={20} />
            </ActionIcon>
          </Group>
          <SimpleGrid cols={5} spacing={4} verticalSpacing={4}>
            {weekDays.map((day) => (
              <UnstyledButton
                key={day}
                onClick={() => setCurrentDate(day)}
                style={{
                  padding: "6px 2px",
                  minWidth: "50px",
                  backgroundColor: day === currentDate ? "#228be6" : "#2c2e33",
                  color: day === currentDate ? "white" : "inherit",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <Text size="xs" c="dimmed">
                  {dayjs(day).format("ddd")}
                </Text>
                <Text size="lg" fw={900}>
                  {dayjs(day).format("DD")}
                </Text>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </Stack>
      </Box>

      <Box>
        {loading ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : (
          (() => {
            const dayData = data.filter((item) => {
              const itemDate = dayjs(item.date).format("YYYY-MM-DD");
              return itemDate === currentDate;
            });

            if (dayData.length === 0) {
              return (
                <Text ta="center" c="dimmed">
                  No data for {currentDate}
                </Text>
              );
            }

            return (
              <Box style={{ overflowX: "auto" }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Time</Table.Th>
                      <Table.Th>Importance</Table.Th>
                      <Table.Th style={{ minWidth: 200 }}>Event</Table.Th>
                      <Table.Th style={{ width: 80 }}>Actual</Table.Th>
                      <Table.Th style={{ width: 80 }}>Previous</Table.Th>
                      <Table.Th style={{ width: 80 }}>Forecast</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {dayData.map((item, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{dayjs(item.date).format("HH:mm")}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              item.importance === 3
                                ? "red"
                                : item.importance === 2
                                  ? "orange"
                                  : "gray"
                            }
                          >
                            {"★".repeat(item.importance)}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 200 }}>
                          <Tooltip
                            label={item.event}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Text
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.event}
                            </Text>
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 120 }}>
                          <Tooltip
                            label={item.actual ?? "-"}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Text
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.actual ?? "-"}
                            </Text>
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 80 }}>
                          <Tooltip
                            label={item.previous ?? "-"}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Text
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.previous ?? "-"}
                            </Text>
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 80 }}>
                          <Tooltip
                            label={item.forecast ?? "-"}
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Text
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.forecast ?? "-"}
                            </Text>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            );
          })()
        )}
      </Box>
    </Stack>
  );
}

export function EconomyFinvizPage() {
  return <EconomyFinvizContent />;
}
