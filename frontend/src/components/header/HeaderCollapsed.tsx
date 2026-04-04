import { Group, ActionIcon } from "@mantine/core";
import { ChevronDown } from "lucide-react";

interface HeaderCollapsedProps {
  onExpand: () => void;
}

function HeaderCollapsed({ onExpand }: HeaderCollapsedProps) {
  return (
    <Group justify="flex-end">
      <ActionIcon variant="subtle" onClick={onExpand} title="Expand">
        <ChevronDown size={20} />
      </ActionIcon>
    </Group>
  );
}

export default HeaderCollapsed;
