import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { MonthView } from "@mantine/schedule";
import type { ScheduleEventData } from "@mantine/schedule";
import { Box, Loader, Center } from "@mantine/core";
import { marketService } from "@/services/market";

function SPACResearchContent() {
  const [currentDate, setCurrentDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const events: ScheduleEventData[] = useMemo(() => {
    return data.map((item) => {
      const dateStr = item.date.includes("T")
        ? item.date.replace("T", " ")
        : `${item.date} 00:00:00`;
      return {
        id: item.symbol + item.date + item.event,
        start: dateStr,
        end: dateStr,
        title: `${item.symbol} - ${item.event}`,
        color:
          item.event === "IpoDate"
            ? "blue"
            : item.event === "ApprovalVote"
              ? "green"
              : item.event === "AmendmentVote"
                ? "orange"
                : item.event === "LiqDeadline"
                  ? "red"
                  : "gray",
      };
    });
  }, [data]);

  return (
    <Box>
      {loading ? (
        <Center h={400}>
          <Loader size="sm" />
        </Center>
      ) : (
        <MonthView
          date={currentDate}
          onDateChange={setCurrentDate}
          events={events}
          withHeader={false}
        />
      )}
    </Box>
  );
}

export function SPACResearchPage() {
  return <SPACResearchContent />;
}
