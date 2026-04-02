import { Button } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const items = [];
  for (let index = 0; index < 100; index++) {
    items.push(<p key={index}>{index}</p>);
  }
  return (
    <div>
      <Button variant="filled">Button</Button>
      {items}
    </div>
  );
}
