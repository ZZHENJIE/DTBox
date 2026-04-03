import { useEffect } from "react";
import type { ReactNode } from "react";
import { Center, Loader } from "@mantine/core";
import { useUserStore } from "#/stores/useUserStore";
import type { UserRole } from "#/stores/useUserStore";

interface RequireRoleProps {
  required: UserRole;
  children: ReactNode;
}

export function RequireRole({ required, children }: RequireRoleProps) {
  const { user, isLoading } = useUserStore();

  useEffect(() => {
    if (!isLoading && user && user.permissions < required) {
      window.location.href = "/no_permission";
    }
  }, [user, isLoading, required]);

  if (isLoading) {
    return (
      <Center h="calc(100vh - 100px)">
        <Loader />
      </Center>
    );
  }

  if (!user || user.permissions < required) {
    return null;
  }

  return <>{children}</>;
}
