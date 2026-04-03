import { Button } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";

function Home() {
  const navigate = useNavigate();

  const item = [];

  for (let i = 0; i < 30; i++) {
    item.push(<p key={i}>{i}</p>);
  }

  return (
    <div>
      <Button
        variant="filled"
        onClick={() =>
          navigate({
            to: "/about",
          })
        }
      >
        Button
      </Button>
      {item}
    </div>
  );
}

const ProtectedHome = withAuthGuard(Home);

export const Route = createFileRoute("/")({
  component: ProtectedHome,
});
