import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { RequireRole } from "#/components/RequireRole";

function RouteComponent() {
  return (
    <RequireRole required={1}>
      <div>Hello "/calendar/spac_research/"!</div>
    </RequireRole>
  );
}

const ProtectedRouteComponent = withAuthGuard(RouteComponent);

export const Route = createFileRoute("/calendar/spac_research/")({
  component: ProtectedRouteComponent,
});
