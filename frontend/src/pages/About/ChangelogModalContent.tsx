import { Text } from "@mantine/core";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";

interface ChangelogModalContentProps {
  version?: string;
}

export function ChangelogModalContent(props: ChangelogModalContentProps) {
  if (!props.version) {
    return <Text>版本获取失败</Text>;
  }

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    fetch(`/Document/Update/${props.version}.md`)
      .then((res) => res.text())
      .then((text) => setValue(text));
  }, []);

  return <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>;
}
