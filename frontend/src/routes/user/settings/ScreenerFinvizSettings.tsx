import { useState, useEffect } from "react";
import {
  Title,
  Table,
  TextInput,
  Button,
  Group,
  ActionIcon,
  Text,
  Tooltip,
  Box,
  NumberInput,
  Switch,
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { useUserStore } from "#/stores/useUserStore";

interface Parameter {
  query: string;
  label: string;
}

interface ScreenerData {
  params: Parameter[];
  pageSize: number;
  autoRefresh: boolean;
  autoRefreshInterval: number;
}

interface ScreenerFinvizSettingsProps {
  data: ScreenerData;
  onChange: (data: Partial<ScreenerData>) => void;
}

export function ScreenerFinvizSettings({
  data,
  onChange,
}: ScreenerFinvizSettingsProps) {
  const { user } = useUserStore();
  const [newQuery, setNewQuery] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editQuery, setEditQuery] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [labelError, setLabelError] = useState("");

  useEffect(() => {
    const config = user?.config as Record<string, unknown> | undefined;
    const finviz = config?.finviz as Record<string, unknown> | undefined;
    const screener = finviz?.screener as Record<string, unknown> | undefined;

    if (screener?.params) {
      onChange({ params: screener.params as Parameter[] });
    }
    if (screener?.pageSize) {
      onChange({ pageSize: screener.pageSize as number });
    }
    if (screener?.autoRefresh !== undefined) {
      onChange({ autoRefresh: screener.autoRefresh as boolean });
    }
    if (screener?.autoRefreshInterval) {
      onChange({ autoRefreshInterval: screener.autoRefreshInterval as number });
    }
  }, []);

  const addParam = () => {
    if (!newQuery.trim() || !newLabel.trim()) return;
    if (data.params.some((p) => p.label === newLabel.trim())) {
      setLabelError("Label must be unique");
      return;
    }
    setLabelError("");
    onChange({
      params: [
        ...data.params,
        { query: newQuery.trim(), label: newLabel.trim() },
      ],
    });
    setNewQuery("");
    setNewLabel("");
  };

  const startEdit = (param: Parameter) => {
    setEditingLabel(param.label);
    setEditQuery(param.query);
    setEditLabel(param.label);
  };

  const saveEdit = () => {
    if (!editQuery.trim() || !editLabel.trim()) return;
    if (
      data.params.some(
        (p) => p.label === editLabel.trim() && p.label !== editingLabel,
      )
    ) {
      setLabelError("Label must be unique");
      return;
    }
    setLabelError("");
    onChange({
      params: data.params.map((p) =>
        p.label === editingLabel
          ? { query: editQuery.trim(), label: editLabel.trim() }
          : p,
      ),
    });
    setEditingLabel(null);
    setEditQuery("");
    setEditLabel("");
  };

  const cancelEdit = () => {
    setEditingLabel(null);
    setEditQuery("");
    setEditLabel("");
    setLabelError("");
  };

  const deleteParam = (label: string) => {
    onChange({
      params: data.params.filter((p) => p.label !== label),
    });
  };

  return (
    <>
      <Title order={4}>Screener</Title>

      <Group>
        <TextInput
          placeholder="Label"
          value={newLabel}
          onChange={(e) => {
            setNewLabel(e.target.value);
            setLabelError("");
          }}
          error={labelError}
          style={{ flex: 1 }}
        />
        <TextInput
          placeholder="Query"
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addParam()}
          style={{ flex: 1 }}
        />
        <Button leftSection={<IconPlus size={16} />} onClick={addParam}>
          Add
        </Button>
      </Group>

      <Box style={{ height: 200, overflowY: "auto" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Label</Table.Th>
              <Table.Th>Query</Table.Th>
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.params.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" ta="center">
                    No parameters
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.params.map((param) => (
                <Table.Tr key={param.label}>
                  <Table.Td>
                    {editingLabel === param.label ? (
                      <TextInput
                        value={editLabel}
                        onChange={(e) => {
                          setEditLabel(e.target.value);
                          setLabelError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        error={labelError}
                      />
                    ) : (
                      param.label
                    )}
                  </Table.Td>
                  <Table.Td>
                    {editingLabel === param.label ? (
                      <TextInput
                        value={editQuery}
                        onChange={(e) => setEditQuery(e.target.value)}
                      />
                    ) : (
                      <Tooltip label={param.query}>
                        <Text
                          style={{
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {param.query}
                        </Text>
                      </Tooltip>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {editingLabel === param.label ? (
                      <Group gap="xs">
                        <Button size="xs" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </Group>
                    ) : (
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => startEdit(param)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => deleteParam(param.label)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>

      <Group>
        <Text size="sm">Page Size:</Text>
        <NumberInput
          value={data.pageSize}
          onChange={(value) => onChange({ pageSize: Number(value) || 20 })}
          min={5}
          max={100}
          style={{ width: 80 }}
        />
        <Text size="sm" ml="lg">
          Auto Refresh:
        </Text>
        <Switch
          checked={data.autoRefresh}
          onChange={(e) => onChange({ autoRefresh: e.target.checked })}
        />
        {data.autoRefresh && (
          <NumberInput
            placeholder="Interval (seconds)"
            value={data.autoRefreshInterval}
            onChange={(value) =>
              onChange({ autoRefreshInterval: Number(value) || 60 })
            }
            min={10}
            max={3600}
            style={{ width: 150 }}
          />
        )}
      </Group>
    </>
  );
}
