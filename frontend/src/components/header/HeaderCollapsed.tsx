import { Group, ActionIcon, Text } from "@mantine/core";
import { ChevronDown } from "lucide-react";

interface HeaderCollapsedProps {
  onExpand: () => void;
}

function HeaderCollapsed({ onExpand }: HeaderCollapsedProps) {
  return (
    <Group justify="flex-end">
      <Text>Hello</Text>
      <ActionIcon variant="subtle" onClick={onExpand} title="Expand">
        <ChevronDown size={20} />
      </ActionIcon>
    </Group>
  );
}

export default HeaderCollapsed;
