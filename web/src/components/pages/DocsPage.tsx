import { useState, type ComponentProps } from "react";
import Markdown from "markdown-to-jsx";

import { ScrollArea } from "~/components/layout/ScrollArea";
import { cn } from "~/lib/utils";

const modules = import.meta.glob("##/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

interface Doc {
  slug: string;
  title: string;
  content: string;
}

function titleize(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const docs: Doc[] = Object.entries(modules)
  .map(([path, content]) => {
    const name = path.slice(path.lastIndexOf("/") + 1);
    const slug = name.replace(/\.md$/, "");
    return { slug, title: titleize(slug), content };
  })
  .filter((d) => d.slug && !d.slug.startsWith("_"))
  .sort((a, b) => a.slug.localeCompare(b.slug));

const markdownOverrides = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="mb-4 mt-6 text-2xl font-semibold" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mb-3 mt-6 border-b pb-1 text-xl font-semibold" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold" {...props} />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4 className="mb-2 mt-3 text-base font-semibold" {...props} />
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
  li: (props: ComponentProps<"li">) => (
    <li className="my-1" {...props} />
  ),
  table: (props: ComponentProps<"table">) => (
    <table className="my-4 w-full border-collapse text-sm" {...props} />
  ),
  thead: (props: ComponentProps<"thead">) => (
    <thead className="bg-muted" {...props} />
  ),
  th: (props: ComponentProps<"th">) => (
    <th className="border px-3 py-2 text-left font-medium" {...props} />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border px-3 py-2 align-top" {...props} />
  ),
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

export default function DocsPage() {
  const [selected, setSelected] = useState<string>(docs[0]?.slug ?? "");
  const doc = docs.find((d) => d.slug === selected);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">文档</h1>
        <p className="text-muted-foreground text-sm">项目 Markdown 文档</p>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <nav className="flex w-48 shrink-0 flex-col gap-1">
          {docs.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => setSelected(d.slug)}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm transition-colors",
                selected === d.slug
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {d.title}
            </button>
          ))}
        </nav>

        <ScrollArea className="min-h-0 flex-1 rounded-lg border bg-card">
          <div className="p-6">
            {doc ? (
              <Markdown options={{ overrides: markdownOverrides }}>
                {doc.content}
              </Markdown>
            ) : (
              <p className="text-muted-foreground text-sm">暂无文档</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
