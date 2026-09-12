import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import {
  resolveNamespacesForPathname,
  loadNamespaceMessages,
  ROUTE_MESSAGE_NAMESPACES,
} from "@/i18n/messages-config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  let pathname = "";
  try {
    const headersList = await headers();
    pathname = headersList.get("x-pathname") || "";
  } catch {}

  const namespaces = pathname
    ? resolveNamespacesForPathname(pathname)
    : ROUTE_MESSAGE_NAMESPACES.gameplay;

  const messages = await loadNamespaceMessages(locale, namespaces);

  return {
    locale,
    messages,
  };
});
