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
    },
  };
});
