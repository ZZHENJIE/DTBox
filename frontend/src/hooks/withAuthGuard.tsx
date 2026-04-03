import { useEffect } from "react";
import type { ComponentType } from "react";
import { Center, Loader } from "@mantine/core";
import { useUserStore } from "#/stores/useUserStore";

export function withAuthGuard<T extends object>(Component: ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    const { isAuthenticated, isLoading } = useUserStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = "/user/login";
      }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
      return (
        <Center h="calc(100vh - 100px)">
          <Loader />
        </Center>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
