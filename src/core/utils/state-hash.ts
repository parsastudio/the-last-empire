export function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const parts = keys.map(
    (key) =>
      `"${key}":${stableStringify((obj as Record<string, unknown>)[key])}`,
  );
  return "{" + parts.join(",") + "}";
}

export function calculateStateHash(state: unknown): string {
  const stableStr = stableStringify(state);
  let hash = 0;
  for (let i = 0; i < stableStr.length; i++) {
    const char = stableStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}
