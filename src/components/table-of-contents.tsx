type TocEntry = {
  title: string;
  url: string;
  items?: TocEntry[];
};

type FlatEntry = { title: string; url: string; level: number };

function flatten(entries: TocEntry[], level = 1): FlatEntry[] {
  return entries.flatMap((e) => [
    { title: e.title, url: e.url, level },
    ...(e.items ? flatten(e.items, level + 1) : []),
  ]);
}

export function TableOfContents({
  toc,
  label,
}: {
  toc: TocEntry[];
  label: string;
}) {
  const items = flatten(toc).filter((e) => e.level <= 3);
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <p className="mb-3 font-medium">{label}</p>
      <ul className="space-y-2 border-l">
        {items.map((item) => (
          <li key={item.url} style={{ paddingLeft: (item.level - 1) * 12 }}>
            <a
              href={item.url}
              className="-ml-px block border-l border-transparent pl-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
