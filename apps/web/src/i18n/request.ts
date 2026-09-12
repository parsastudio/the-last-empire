import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [
    common,
    projects,
    governments,
    politics,
    military,
    dilemmas,
    diplomacy,
    industry,
    espionage,
    reports,
    gameOver,
    attack,
    menu,
    selectNation,
    hud,
    overview,
    map,
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`).then((m) => m.default),
    import(`../../messages/${locale}/projects.json`).then((m) => m.default),
    import(`../../messages/${locale}/governments.json`).then((m) => m.default),
    import(`../../messages/${locale}/politics.json`).then((m) => m.default),
    import(`../../messages/${locale}/military.json`).then((m) => m.default),
    import(`../../messages/${locale}/dilemmas.json`).then((m) => m.default),
    import(`../../messages/${locale}/diplomacy.json`).then((m) => m.default),
    import(`../../messages/${locale}/industry.json`).then((m) => m.default),
    import(`../../messages/${locale}/espionage.json`).then((m) => m.default),
    import(`../../messages/${locale}/reports.json`).then((m) => m.default),
    import(`../../messages/${locale}/game-over.json`).then((m) => m.default),
    import(`../../messages/${locale}/attack.json`).then((m) => m.default),
    import(`../../messages/${locale}/menu.json`).then((m) => m.default),
    import(`../../messages/${locale}/select-nation.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/hud.json`).then((m) => m.default),
    import(`../../messages/${locale}/overview.json`).then((m) => m.default),
    import(`../../messages/${locale}/map.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      projects,
      governments,
      politics,
      military,
      dilemmas,
      diplomacy,
      industry,
      espionage,
      reports,
      gameOver,
      attack,
      menu,
      selectNation,
      hud,
      overview,
      map,
    },
  };
});
