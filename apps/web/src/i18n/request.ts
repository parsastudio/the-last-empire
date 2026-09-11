import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const projects = (await import(`../../messages/${locale}/projects.json`))
    .default;
  const governments = (
    await import(`../../messages/${locale}/governments.json`)
  ).default;
  const politics = (await import(`../../messages/${locale}/politics.json`))
    .default;
  const military = (await import(`../../messages/${locale}/military.json`))
    .default;
  const dilemmas = (await import(`../../messages/${locale}/dilemmas.json`))
    .default;
  const diplomacy = (await import(`../../messages/${locale}/diplomacy.json`))
    .default;
  const industry = (await import(`../../messages/${locale}/industry.json`))
    .default;
  const espionage = (await import(`../../messages/${locale}/espionage.json`))
    .default;
  const reports = (await import(`../../messages/${locale}/reports.json`))
    .default;
  const gameOver = (await import(`../../messages/${locale}/game-over.json`))
    .default;
  const attack = (await import(`../../messages/${locale}/attack.json`)).default;
  const menu = (await import(`../../messages/${locale}/menu.json`)).default;
  const selectNation = (
    await import(`../../messages/${locale}/select-nation.json`)
  ).default;
  const hud = (await import(`../../messages/${locale}/hud.json`)).default;
  const overview = (await import(`../../messages/${locale}/overview.json`))
    .default;
  const map = (await import(`../../messages/${locale}/map.json`)).default;

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
