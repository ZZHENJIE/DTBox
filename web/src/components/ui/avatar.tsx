import * as React from "react";

import { cn } from "~/lib/utils";

type AvatarStatus = "loading" | "loaded" | "error";

interface AvatarContextValue {
  status: AvatarStatus;
  setStatus: (status: AvatarStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  const [status, setStatus] = React.useState<AvatarStatus>("loading");

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        data-slot="avatar"
        className={cn(
          "relative flex size-8 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<"img">) {
  const ctx = React.useContext(AvatarContext);

  if (!props.src || ctx?.status === "error") {
    return null;
  }

  return (
    <img
      data-slot="avatar-image"
      className={cn("absolute inset-0 size-full object-cover", className)}
      onLoad={() => ctx?.setStatus("loaded")}
      onError={() => ctx?.setStatus("error")}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  const ctx = React.useContext(AvatarContext);

  if (ctx?.status === "loaded") {
    return null;
  }

  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
