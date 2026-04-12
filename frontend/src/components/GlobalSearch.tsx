import { useState } from "react";
import { TextInput, Box, ActionIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

interface GlobalSearchProps {
  onSearch?: (value: string) => void;
}

export function GlobalSearch({ onSearch }: GlobalSearchProps) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSearch = () => {
    if (!value.trim()) return;
    const symbol = value.trim().toUpperCase();
    navigate(`/quote/${symbol}`);
    onSearch?.(symbol);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box style={{ width: isDesktop ? 250 : "100%" }}>
      <TextInput
        placeholder="Search symbol..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        size="sm"
        style={{ width: "100%" }}
        rightSection={
          <ActionIcon variant="subtle" onClick={handleSearch} size="sm">
            <IconSearch size={16} />
          </ActionIcon>
        }
      />
    </Box>
  );
}