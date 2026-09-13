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

export async function loadLocaleMessages(
  locale: string,
): Promise<Record<string, unknown>> {
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

  return Object.fromEntries(entries);
}

export async function loadNamespaceMessages(
  locale: string,
  namespaces: readonly MessageNamespace[],
): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const fileName = NAMESPACE_FILE_MAP[ns];
      try {
        const module = await import(`../../messages/${locale}/${fileName}`);
        return [ns, module.default] as const;
      } catch {
        return [ns, {}] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}
