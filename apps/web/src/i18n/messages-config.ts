export type MessageNamespace =
  | "attack"
  | "common"
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

export const ROUTE_MESSAGE_NAMESPACES = {
  root: ["common", "hud"] as const,
  menu: ["common", "hud", "menu"] as const,
  selectNation: ["common", "hud", "selectNation", "governments"] as const,
  gameplay: [
    "common",
    "hud",
    "overview",
    "map",
    "military",
    "industry",
    "projects",
    "politics",
    "diplomacy",
    "espionage",
    "reports",
    "attack",
    "dilemmas",
    "gameOver",
    "governments",
  ] as const,
} as const;

const NAMESPACE_FILE_MAP: Record<MessageNamespace, string> = {
  attack: "attack.json",
  common: "common.json",
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

export function resolveNamespacesForPathname(
  pathname: string,
): readonly MessageNamespace[] {
  const clean = pathname.replace(/^\/(fa|en)/, "");

  if (clean.startsWith("/play")) {
    return ROUTE_MESSAGE_NAMESPACES.gameplay;
  }

  if (clean.startsWith("/select-nation")) {
    return ROUTE_MESSAGE_NAMESPACES.selectNation;
  }

  if (clean === "" || clean === "/") {
    return ROUTE_MESSAGE_NAMESPACES.menu;
  }

  return ROUTE_MESSAGE_NAMESPACES.root;
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
