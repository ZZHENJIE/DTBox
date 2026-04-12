import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";

export function GatewayPage() {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    fetch("/Document/Gateway.md")
      .then((res) => res.text())
      .then((text) => setValue(text));
  }, []);

  return <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>;
}
