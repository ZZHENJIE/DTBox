import { RequireRole } from "#/components/RequireRole";
import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";

function RouteComponent() {
  return (
    <RequireRole required={1}>
      <div>Hello "/tool/screener_finviz/"!</div>
    </RequireRole>
  );
}

const ProtectedRouteComponent = withAuthGuard(RouteComponent);

export const Route = createFileRoute("/tool/screener_finviz/")({
  component: ProtectedRouteComponent,
});
