import { useMediaQuery } from "@mantine/hooks";
import { useAuthStore } from "../../stores/authStore";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export function Header() {
  const isDesktop = useMediaQuery("(min-width: 830px)");
  const { user, isAuthenticated } = useAuthStore();

  return isDesktop ? (
    <DesktopHeader user={user} isAuthenticated={isAuthenticated} />
  ) : (
    <MobileHeader user={user} isAuthenticated={isAuthenticated} />
  );
}
