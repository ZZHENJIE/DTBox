import { Button, localStorageColorSchemeManager } from "@mantine/core";
import { IconLighter } from "@tabler/icons-react";

export const ThemeToggle = () => {
  const manager = localStorageColorSchemeManager();

  const isDark = (value: string) => {
    return (
      value === "dark" ||
      (value === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  };

  const toggle = () => {
    manager.set(isDark(manager.get("auto")) ? "light" : "dark");
    location.reload();
  };

  return (
    <Button
      leftSection={<IconLighter size={16} />}
      onClick={() => toggle()}
    ></Button>
  );
};

export default ThemeToggle;
