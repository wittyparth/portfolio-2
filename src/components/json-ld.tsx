/** Renders schema.org JSON-LD. "<" is escaped so no string in the data can close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const graph = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data };
  const json = JSON.stringify(graph).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
