/** Trim a value that may be null/undefined without throwing. */
export function safeTrim(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value).trim();
}

/** Uppercase after safe trim; useful for status enums. */
export function safeUpper(value: unknown, fallback = ""): string {
  const trimmed = safeTrim(value, fallback);
  return trimmed ? trimmed.toUpperCase() : fallback;
}

export function toJsonString(value: unknown): string {
  if (value == null) return "{}";
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value);
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
