import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { WeekView } from "@mantine/schedule";
import type { ScheduleEventData } from "@mantine/schedule";
import {
  Box,
  Loader,
  Center,
  Modal,
  Text,
  Stack,
  Group,
  Badge,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  marketService,
  type FinvizCalendarEconomyItem,
} from "@/services/market";

dayjs.extend(utc);
dayjs.extend(timezone);

const IMPORTANCE_COLORS: Record<number, string> = {
  1: "green",
  2: "blue",
  3: "red",
};

function EconomyFinvizContent() {
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = dayjs();
    const monday = today.day(1).format("YYYY-MM-DD");
    return monday;
  });
  const [data, setData] = useState<FinvizCalendarEconomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] =
    useState<FinvizCalendarEconomyItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const monday = dayjs(currentDate).day(1).format("YYYY-MM-DD");
        const friday = dayjs(currentDate).day(5).format("YYYY-MM-DD");
        const result = await marketService.getCalendarEconomy(monday, friday);
        setData(result);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  const events: ScheduleEventData[] = useMemo(() => {
    const nonAllDayData = data.filter((item) => !item.allDay);
    return nonAllDayData.map((item) => {
      const timeStr = item.date.replace("T", " ");
      return {
        id: item.calendarId,
        start: dayjs(timeStr)
          .subtract(15, "minute")
          .format("YYYY-MM-DD HH:mm:ss"),
        end: dayjs(timeStr).add(15, "minute").format("YYYY-MM-DD HH:mm:ss"),
        title: item.event,
        color: IMPORTANCE_COLORS[item.importance] ?? "gray",
      };
    });
  }, [data]);

  const dataMap = useMemo(() => {
    const map = new Map<number, FinvizCalendarEconomyItem>();
    data.forEach((item) => map.set(item.calendarId, item));
    return map;
  }, [data]);

  const handleEventClick = (event: ScheduleEventData) => {
    const item = dataMap.get(Number(event.id));
    if (item) {
      setSelectedEvent(item);
    }
  };

  const handlePrevWeek = () => {
    setCurrentDate((prev) =>
      dayjs(prev).subtract(7, "day").format("YYYY-MM-DD"),
    );
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => dayjs(prev).add(7, "day").format("YYYY-MM-DD"));
  };

  const weekLabel = useMemo(() => {
    const monday = dayjs(currentDate).day(1).format("YYYY-MM-DD");
    const friday = dayjs(currentDate).day(5).format("YYYY-MM-DD");
    return `${monday} ~ ${friday}`;
  }, [currentDate]);

  return (
    <Box>
      <Group justify="center" mb="md" gap="lg">
        <ActionIcon variant="subtle" onClick={handlePrevWeek}>
          <IconChevronLeft size={20} />
        </ActionIcon>
        <Text fw={600}>{weekLabel}</Text>
        <ActionIcon variant="subtle" onClick={handleNextWeek}>
          <IconChevronRight size={20} />
        </ActionIcon>
      </Group>

      {loading ? (
        <Center h={400}>
          <Loader size="sm" />
        </Center>
      ) : (
        <WeekView
          date={currentDate}
          onDateChange={setCurrentDate}
          events={events}
          startTime="05:00:00"
          endTime="21:00:00"
          withWeekendDays={false}
          firstDayOfWeek={1}
          weekdayFormat="ddd"
          onEventClick={handleEventClick}
          withAllDaySlots={false}
          withHeader={false}
          withCurrentTimeIndicator={false}
        />
      )}

      <Modal
        opened={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.event}
        size="md"
      >
        {selectedEvent && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Time
              </Text>
              <Text size="sm">{selectedEvent.date}</Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Importance
              </Text>
              <Badge
                color={IMPORTANCE_COLORS[selectedEvent.importance] ?? "gray"}
              >
                {"★".repeat(selectedEvent.importance)}
              </Badge>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Actual
              </Text>
              <Text size="sm">{selectedEvent.actual ?? "-"}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Previous
              </Text>
              <Text size="sm">{selectedEvent.previous ?? "-"}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Forecast
              </Text>
              <Text size="sm">{selectedEvent.forecast ?? "-"}</Text>
            </Group>
            {selectedEvent.ticker && (
              <>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Ticker
                  </Text>
                  <Text size="sm" fw={600}>
                    {selectedEvent.ticker}
                  </Text>
                </Group>
              </>
            )}
            {selectedEvent.category && (
              <>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Category
                  </Text>
                  <Text size="sm">{selectedEvent.category}</Text>
                </Group>
              </>
            )}
          </Stack>
        )}
      </Modal>
    </Box>
  );
}

export function EconomyFinvizPage() {
  return <EconomyFinvizContent />;
}
