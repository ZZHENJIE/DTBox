import { useState } from "react";
import {
  Text,
  TextInput,
  Select,
  Switch,
  Group,
  Divider,
  Table,
  ActionIcon,
  ScrollArea,
  SimpleGrid,
  Paper,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit, IconCheck } from "@tabler/icons-react";

import type {
  UserSettings,
  FinvizInterval,
  FinvizScreenerParameter,
} from "../../stores/settingsStore";

const INTERVAL_OPTIONS: { value: FinvizInterval; label: string }[] = [
  { value: "Minutes", label: "1分钟" },
  { value: "Minutes2", label: "2分钟" },
  { value: "Minutes3", label: "3分钟" },
  { value: "Minutes5", label: "5分钟" },
  { value: "Minutes10", label: "10分钟" },
  { value: "Minutes15", label: "15分钟" },
  { value: "Minutes30", label: "30分钟" },
  { value: "Hour", label: "1小时" },
  { value: "Hour2", label: "2小时" },
  { value: "Hour4", label: "4小时" },
  { value: "Day", label: "日线" },
  { value: "Week", label: "周线" },
  { value: "Month", label: "月线" },
];

const PAGE_COUNT_OPTIONS = [
  { value: "20", label: "20" },
  { value: "30", label: "30" },
  { value: "60", label: "60" },
];

const AUTO_REFRESH_OPTIONS = [
  { value: "10", label: "10秒" },
  { value: "30", label: "30秒" },
  { value: "60", label: "60秒" },
  { value: "180", label: "3分钟" },
];

interface FinvizSettingsProps {
  settings: UserSettings;
  onChange: (settings: UserSettings) => void;
}

export function FinvizSettings({ settings, onChange }: FinvizSettingsProps) {
  const [newParamLabel, setNewParamLabel] = useState("");
  const [newParamValue, setNewParamValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");

  const handleAddParameter = () => {
    if (!newParamLabel.trim() || !newParamValue.trim()) {
      return;
    }

    const newParam: FinvizScreenerParameter = {
      label: newParamLabel.trim(),
      value: newParamValue.trim(),
    };

    onChange({
      ...settings,
      finviz: {
        ...settings.finviz,
        screener: {
          ...settings.finviz.screener,
          parameter: [...settings.finviz.screener.parameter, newParam],
        },
      },
    });

    setNewParamLabel("");
    setNewParamValue("");
  };

  const handleRemoveParameter = (index: number) => {
    onChange({
      ...settings,
      finviz: {
        ...settings.finviz,
        screener: {
          ...settings.finviz.screener,
          parameter: settings.finviz.screener.parameter.filter(
            (_, i) => i !== index,
          ),
        },
      },
    });
  };

  const handleStartEdit = (index: number) => {
    const param = settings.finviz.screener.parameter[index];
    setEditingIndex(index);
    setEditLabel(param.label);
    setEditValue(param.value);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    onChange({
      ...settings,
      finviz: {
        ...settings.finviz,
        screener: {
          ...settings.finviz.screener,
          parameter: settings.finviz.screener.parameter.map((param, i) =>
            i === editingIndex ? { label: editLabel, value: editValue } : param,
          ),
        },
      },
    });

    setEditingIndex(null);
    setEditLabel("");
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditLabel("");
    setEditValue("");
  };

  return (
    <div>
      {/* 筛选器 */}
      <Paper withBorder radius="md" p="xl">
        <Title order={2} mb="lg">
          筛选器
        </Title>

        <SimpleGrid cols={3} spacing="lg" verticalSpacing="md">
          {/* 每页显示数量 */}
          <Group gap="xs">
            <Text fw={500} w={90}>
              每页显示
            </Text>
            <Select
              data={PAGE_COUNT_OPTIONS}
              value={String(settings.finviz.screener.page_count)}
              onChange={(value) => {
                if (value) {
                  onChange({
                    ...settings,
                    finviz: {
                      ...settings.finviz,
                      screener: {
                        ...settings.finviz.screener,
                        page_count: Number(value) as 20 | 30 | 60,
                      },
                    },
                  });
                }
              }}
              w={80}
            />
            <Text c="dimmed" size="sm">
              条
            </Text>
          </Group>

          {/* 自动刷新 */}
          <Group gap="xs">
            <Text fw={500} w={90}>
              自动刷新
            </Text>
            <Select
              data={AUTO_REFRESH_OPTIONS}
              value={String(settings.finviz.screener.auto_refersh)}
              onChange={(value) => {
                if (value) {
                  onChange({
                    ...settings,
                    finviz: {
                      ...settings.finviz,
                      screener: {
                        ...settings.finviz.screener,
                        auto_refersh: Number(value) as 10 | 30 | 60 | 180,
                      },
                    },
                  });
                }
              }}
              w={100}
            />
          </Group>
        </SimpleGrid>

        <Divider my="lg" />

        {/* 筛选参数 */}
        <div>
          <Text fw={500} mb="sm">
            筛选参数
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            添加自定义筛选条件，用于股票筛选器
          </Text>

          {/* 参数列表 - 使用 Table 显示 */}
          {settings.finviz.screener.parameter.length > 0 ? (
            <ScrollArea h={200}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>参数名称</Table.Th>
                    <Table.Th>参数值</Table.Th>
                    <Table.Th w={100}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {settings.finviz.screener.parameter.map((param, index) => (
                    <Table.Tr key={index}>
                      {editingIndex === index ? (
                        <>
                          <Table.Td>
                            <TextInput
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              size="xs"
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              size="xs"
                            />
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                size="sm"
                                variant="filled"
                                color="green"
                                onClick={handleSaveEdit}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                variant="outline"
                                color="gray"
                                onClick={handleCancelEdit}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </>
                      ) : (
                        <>
                          <Table.Td>{param.label}</Table.Td>
                          <Table.Td>{param.value}</Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="blue"
                                onClick={() => handleStartEdit(index)}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => handleRemoveParameter(index)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Text c="dimmed" size="sm" ta="center" py="md">
              暂无筛选参数
            </Text>
          )}

          {/* 添加参数 */}
          <Group mt="md">
            <TextInput
              placeholder="参数名称 (如 sector)"
              value={newParamLabel}
              onChange={(e) => setNewParamLabel(e.target.value)}
              style={{ flex: 1 }}
            />
            <TextInput
              placeholder="参数值 (如 Technology)"
              value={newParamValue}
              onChange={(e) => setNewParamValue(e.target.value)}
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="filled"
              color="blue"
              onClick={handleAddParameter}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </div>
      </Paper>

      <Divider my="lg" />

      {/* 缩略图 */}
      <Paper withBorder radius="md" p="xl">
        <Title order={2} mb="lg">
          缩略图
        </Title>
        <SimpleGrid cols={3} spacing="lg" verticalSpacing="md">
          {/* 图表时间间隔 */}
          <Group gap="xs">
            <Text fw={500} w={90}>
              时间间隔
            </Text>
            <Select
              data={INTERVAL_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={settings.finviz.thumbnail.interval}
              onChange={(value) => {
                if (value) {
                  onChange({
                    ...settings,
                    finviz: {
                      ...settings.finviz,
                      thumbnail: {
                        ...settings.finviz.thumbnail,
                        interval: value as FinvizInterval,
                      },
                    },
                  });
                }
              }}
              w={120}
            />
          </Group>

          {/* 盘前数据 */}
          <Group gap="xs">
            <Text fw={500} w={90}>
              显示盘前
            </Text>
            <Switch
              checked={settings.finviz.thumbnail.pre_market}
              onChange={() => {
                onChange({
                  ...settings,
                  finviz: {
                    ...settings.finviz,
                    thumbnail: {
                      ...settings.finviz.thumbnail,
                      pre_market: !settings.finviz.thumbnail.pre_market,
                    },
                  },
                });
              }}
            />
          </Group>

          {/* 盘后数据 */}
          <Group gap="xs">
            <Text fw={500} w={90}>
              显示盘后
            </Text>
            <Switch
              checked={settings.finviz.thumbnail.after_hours}
              onChange={() => {
                onChange({
                  ...settings,
                  finviz: {
                    ...settings.finviz,
                    thumbnail: {
                      ...settings.finviz.thumbnail,
                      after_hours: !settings.finviz.thumbnail.after_hours,
                    },
                  },
                });
              }}
            />
          </Group>
        </SimpleGrid>
      </Paper>
    </div>
  );
}
