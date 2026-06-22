type TocEntry = {
  title: string;
  url: string;
  depth: number;
};

export function TableOfContents({
  toc,
  label,
}: {
  toc: TocEntry[];
  label: string;
}) {
  const items = toc.filter((e) => e.depth <= 3);
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <p className="mb-3 font-medium">{label}</p>
      <ul className="space-y-2 border-l">
        {items.map((item) => (
          <li key={item.url} style={{ paddingLeft: (item.depth - 2) * 12 }}>
            <a
              href={item.url}
              className="text-muted-foreground hover:text-foreground -ml-px block border-l border-transparent pl-3 transition-colors"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
