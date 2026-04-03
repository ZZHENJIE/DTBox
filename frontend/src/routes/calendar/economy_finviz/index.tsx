import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { RequireRole } from "#/components/RequireRole";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Text,
  Container,
  SimpleGrid,
  UnstyledButton,
  ActionIcon,
  Group,
  Table,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EconomyFinvizItem } from "#/services/api";
import { economyApi } from "#/services/api";

function RouteComponent() {
  const [currentDate, setCurrentDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [weekRange, setWeekRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [data, setData] = useState<EconomyFinvizItem[]>([]);
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
        const result = await economyApi.Finviz(weekRange.start, weekRange.end);
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
    setCurrentDate((prev) => dayjs(prev).add(7, "day").format("YYYY-MM-DD"));
  };

  const weekDays: string[] = [];
  const current = dayjs(currentDate).day(1);
  for (let i = 0; i < 5; i++) {
    weekDays.push(current.add(i, "day").format("YYYY-MM-DD"));
  }

  return (
    <RequireRole required={1}>
      <Container>
        <Group justify="center" mb="md">
          <ActionIcon variant="subtle" onClick={goToPrevWeek}>
            <ChevronLeft size={20} />
          </ActionIcon>
          <Text fw={700}>
            {weekRange.start} ~ {weekRange.end}
          </Text>
          <ActionIcon variant="subtle" onClick={goToNextWeek}>
            <ChevronRight size={20} />
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
              <Text size="lg" fw={700}>
                {dayjs(day).format("DD")}
              </Text>
            </UnstyledButton>
          ))}
        </SimpleGrid>

        {loading ? (
          <Center mt="xl">
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
                <Text ta="center" mt="xl" c="dimmed">
                  No data for {currentDate}
                </Text>
              );
            }

            return (
              <Table mt="xl" striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>Importance</Table.Th>
                    <Table.Th>Event</Table.Th>
                    <Table.Th>Actual</Table.Th>
                    <Table.Th>Previous</Table.Th>
                    <Table.Th>Forecast</Table.Th>
                    <Table.Th>Ticker</Table.Th>
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
                      <Table.Td>{item.event}</Table.Td>
                      <Table.Td>
                        {item.actual ? (
                          <Badge
                            color={
                              item.isHigherPositive === 1
                                ? item.previous &&
                                  Number(item.actual) > Number(item.previous)
                                  ? "green"
                                  : "red"
                                : item.previous &&
                                    Number(item.actual) > Number(item.previous)
                                  ? "red"
                                  : "green"
                            }
                          >
                            {item.actual}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </Table.Td>
                      <Table.Td>{item.previous ?? "-"}</Table.Td>
                      <Table.Td>{item.forecast ?? "-"}</Table.Td>
                      <Table.Td>{item.ticker ?? "-"}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            );
          })()
        )}
      </Container>
    </RequireRole>
  );
}

const ProtectedRouteComponent = withAuthGuard(RouteComponent);

export const Route = createFileRoute("/calendar/economy_finviz/")({
  component: ProtectedRouteComponent,
});
