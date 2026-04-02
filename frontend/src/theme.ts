import { createTheme } from "@mantine/core";

export const theme = createTheme({
  respectReducedMotion: true,
  defaultRadius: "sm",
  spacing: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  fontFamily: "system-ui, -apple-system, sans-serif",
  primaryColor: "blue",
});
