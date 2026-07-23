export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (typeof structuredClone !== "undefined") {
    return structuredClone(obj);
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const copy = {} as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    copy[key] = deepClone((obj as Record<string, unknown>)[key]);
  }

  return copy as T;
}
