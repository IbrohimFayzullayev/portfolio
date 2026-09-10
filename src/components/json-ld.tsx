/**
 * Renders a JSON-LD block.
 *
 * A plain <script> rather than next/script: structured data has to be in the
 * server-rendered HTML for a crawler to see it, and next/script's default
 * strategies inject it client-side.
 */
export function JsonLd({ id, data }: { id: string; data: unknown }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // Values come from our own database, and JSON.stringify escapes them.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
