export function toIsoTimestamp(value?: Date | string): string {
  if (value === undefined) return new Date().toISOString();
  if (typeof value === "string") return value;
  return value.toISOString();
}

export function parseTraceTimestamp(value: string): number {
  return new Date(value).getTime();
}
