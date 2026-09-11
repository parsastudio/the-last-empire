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

  return {
    locale,
    messages: {
      common,
      projects,
      governments,
      politics,
    },
  };
});
