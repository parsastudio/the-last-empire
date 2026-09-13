export type MessageNamespace =
  | "attack"
  | "common"
  | "countries"
  | "dilemmas"
  | "diplomacy"
  | "espionage"
  | "gameOver"
  | "governments"
  | "hud"
  | "industry"
  | "map"
  | "menu"
  | "military"
  | "overview"
  | "politics"
  | "projects"
  | "reports"
  | "selectNation";

export const ALL_MESSAGE_NAMESPACES: readonly MessageNamespace[] = [
  "attack",
  "common",
  "countries",
  "dilemmas",
  "diplomacy",
  "espionage",
  "gameOver",
  "governments",
  "hud",
  "industry",
  "map",
  "menu",
  "military",
  "overview",
  "politics",
  "projects",
  "reports",
  "selectNation",
] as const;

const NAMESPACE_FILE_MAP: Record<MessageNamespace, string> = {
  attack: "attack.json",
  common: "common.json",
  countries: "countries.json",
  dilemmas: "dilemmas.json",
  diplomacy: "diplomacy.json",
  espionage: "espionage.json",
  gameOver: "game-over.json",
  governments: "governments.json",
  hud: "hud.json",
  industry: "industry.json",
  map: "map.json",
  menu: "menu.json",
  military: "military.json",
  overview: "overview.json",
  politics: "politics.json",
  projects: "projects.json",
  reports: "reports.json",
  selectNation: "select-nation.json",
};

const messagesMemoryCache = new Map<string, Record<string, unknown>>();

export async function loadLocaleMessages(
  locale: string,
): Promise<Record<string, unknown>> {
  if (process.env.NODE_ENV === "production") {
    const cached = messagesMemoryCache.get(locale);
    if (cached) {
      return cached;
    }
  }

  const entries = await Promise.all(
    ALL_MESSAGE_NAMESPACES.map(async (ns) => {
      const fileName = NAMESPACE_FILE_MAP[ns];
      try {
        const module = await import(`../../messages/${locale}/${fileName}`);
        return [ns, module.default] as const;
      } catch {
        return [ns, {}] as const;
      }
    }),
  );

  const merged = Object.fromEntries(entries);

  if (process.env.NODE_ENV === "production") {
    messagesMemoryCache.set(locale, merged);
  }

  return merged;
}
