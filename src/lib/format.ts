// Dates in content are YYYY-MM-DD; format them in UTC so server and client always agree.
const at = (iso: string) => new Date(`${iso}T00:00:00Z`);

export const longDate = (iso: string) =>
  at(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export const shortDate = (iso: string) =>
  at(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export const compact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
