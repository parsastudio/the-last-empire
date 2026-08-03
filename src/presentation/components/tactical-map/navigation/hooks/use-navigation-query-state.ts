import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";

export function buildQueryString(
  params: Record<string, string | number | undefined | null>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function useNavigationQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as SidebarTabType) || null;
  const activeSubTab = searchParams.get("subTab") || null;
  const activeTarget = searchParams.get("target") || null;
  const activeModal = searchParams.get("modal") || null;

  const navigateToTab = useCallback(
    (tab: SidebarTabType, subTab?: string, target?: string) => {
      const query = buildQueryString({
        tab,
        subTab,
        target: target || activeTarget || undefined,
        modal: activeModal || undefined,
      });
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname, activeTarget, activeModal],
  );

  const setModal = useCallback(
    (modalName: string | null) => {
      const query = buildQueryString({
        tab: activeTab || undefined,
        subTab: activeSubTab || undefined,
        target: activeTarget || undefined,
        modal: modalName || undefined,
      });
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname, activeTab, activeSubTab, activeTarget],
  );

  const clearNavigation = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    activeTab,
    activeSubTab,
    activeTarget,
    activeModal,
    navigateToTab,
    setModal,
    clearNavigation,
  };
}
