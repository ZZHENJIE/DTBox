import type { ComponentProps } from "react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

import { ScrollArea } from "~/components/layout/ScrollArea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const changelogModules = import.meta.glob("##/CHANGELOG.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const changelogContent = Object.values(changelogModules)[0] ?? "";

const markdownOverrides = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="mb-4 mt-2 text-2xl font-semibold" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mb-3 mt-6 text-xl font-semibold" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-3 text-sm leading-relaxed" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a className="text-primary underline" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-3 list-disc pl-6 text-sm" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-3 list-decimal pl-6 text-sm" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="my-1" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="text-muted-foreground my-3 border-l-4 pl-4"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code className="font-mono text-xs" {...props} />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="bg-muted my-3 overflow-x-auto rounded-md p-3 text-xs"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-4" />,
};

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogDialog({ open, onOpenChange }: ChangelogDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("changelog.title")}</DialogTitle>
          <DialogDescription>{t("changelog.subtitle")}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {changelogContent ? (
            <Markdown options={{ overrides: markdownOverrides }}>
              {changelogContent}
            </Markdown>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("changelog.empty")}
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
