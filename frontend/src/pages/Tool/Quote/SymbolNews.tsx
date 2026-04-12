import { useState, useEffect } from "react";
import { Table, Anchor, Text, Loader, Center } from "@mantine/core";
import { marketService, type FinvizEventItem } from "@/services/market";

interface SymbolNewsProps {
  symbol: string;
  maxHeight?: number;
}

export function SymbolNews({ symbol, maxHeight }: SymbolNewsProps) {
  const [news, setNews] = useState<FinvizEventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    const fetchNews = async () => {
      setLoading(true);
      try {
        const result = await marketService.getEvent({ type: "Stock", symbol });
        const items = ((result as any)?.Symbol as FinvizEventItem[]) || [];
        setNews(items.slice(0, 20));
      } catch {
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (news.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No news available
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth={500} maxHeight={maxHeight}>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Source</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {news.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size="xs" c="dimmed">
                  {item.Date}
                </Text>
              </Table.Td>
              <Table.Td>
                <Anchor href={item.Url} target="_blank" size="sm">
                  {item.Title}
                </Anchor>
              </Table.Td>
              <Table.Td>
                <Text size="xs">{item.Source}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
