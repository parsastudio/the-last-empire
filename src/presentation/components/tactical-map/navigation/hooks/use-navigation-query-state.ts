import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SidebarTabType } from "../../sidebar/sidebar-tabs";
import { NavigationUrlBuilder } from "../utils/navigation-url-builder";

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
      const query = NavigationUrlBuilder.buildQueryString({
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
      const query = NavigationUrlBuilder.buildQueryString({
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
