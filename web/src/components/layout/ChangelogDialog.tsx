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
    <h1
      className="scroll-m-20 border-b pb-2 text-2xl font-bold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="scroll-m-20 mt-8 flex items-center gap-2 border-b pb-2 text-[1.35rem] font-semibold tracking-tight first:mt-0 [&>a]:no-underline"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="scroll-m-20 mt-6 text-[1.05rem] font-semibold tracking-tight" {...props} />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4 className="scroll-m-20 mt-4 text-sm font-semibold tracking-tight" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="text-foreground/90 my-3 text-[13.5px] leading-7" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-primary font-medium underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 ml-6 list-disc space-y-1.5 text-[13.5px] marker:text-muted-foreground" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 ml-6 list-decimal space-y-1.5 text-[13.5px] marker:text-muted-foreground" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="leading-7 [&>p]:my-1" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="bg-muted/50 text-muted-foreground my-4 border-l-2 border-primary/40 px-4 py-2 text-[13.5px] italic [&>p]:my-1"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => {
    // inline code vs block code: block code is inside <pre>, inline otherwise
    const isInline = !String(props.className ?? "").includes("lang-");
    if (isInline) {
      return (
        <code
          className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[12px] font-medium ring-1 ring-border"
          {...props}
        />
      );
    }
    return <code className="font-mono text-xs" {...props} />;
  },
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="bg-muted/70 border my-4 overflow-x-auto rounded-lg border p-4 text-xs leading-relaxed"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-6" />,
  table: (props: ComponentProps<"table">) => (
    <div className="my-4 w-full overflow-auto rounded-md border">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentProps<"thead">) => (
    <thead className="bg-muted/60" {...props} />
  ),
  th: (props: ComponentProps<"th">) => (
    <th className="px-3 py-2 text-left text-xs font-semibold" {...props} />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-t px-3 py-2 text-[13px]" {...props} />
  ),
  tr: (props: ComponentProps<"tr">) => <tr className="hover:bg-muted/30" {...props} />,
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  em: (props: ComponentProps<"em">) => <em className="italic" {...props} />,
  img: (props: ComponentProps<"img">) => (
    <img className="my-4 max-w-full rounded-md border" {...props} alt={props.alt ?? ""} />
  ),
};

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogDialog({ open, onOpenChange }: ChangelogDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>{t("changelog.title")}</DialogTitle>
          <DialogDescription>{t("changelog.subtitle")}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 py-5">
            {changelogContent ? (
              <div className="max-w-none">
                <Markdown options={{ overrides: markdownOverrides, forceBlock: true }}>
                  {changelogContent}
                </Markdown>
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("changelog.empty")}
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
